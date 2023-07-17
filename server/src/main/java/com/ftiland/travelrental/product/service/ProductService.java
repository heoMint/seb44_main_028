package com.ftiland.travelrental.product.service;

import com.ftiland.travelrental.category.dto.CategoryDto;
import com.ftiland.travelrental.common.exception.BusinessLogicException;
import com.ftiland.travelrental.common.exception.ExceptionCode;
import com.ftiland.travelrental.image.entity.ImageMember;
import com.ftiland.travelrental.image.service.ImageService;
import com.ftiland.travelrental.member.service.MemberService;

import com.ftiland.travelrental.member.entity.Member;

import com.ftiland.travelrental.product.dto.*;
import com.ftiland.travelrental.product.entity.Product;
import com.ftiland.travelrental.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import static com.ftiland.travelrental.common.exception.ExceptionCode.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final MemberService memberService;
    private final ProductCategoryService productCategoryService;
    private final ImageService imageService;

    @Transactional
    public CreateProduct.Response createProduct(CreateProduct.Request request, Long memberId) {
        log.info("[ProductService] createProduct called");
        Member member = memberService.findMember(memberId);

        if (member.getLatitude() == null || member.getLongitude() == null) {
            throw new BusinessLogicException(NOT_FOUND_LOCATION);
        }

        Random random = new Random();
        int totalRateScore = random.nextInt(1000);

        Product productEntity = Product.builder()
                .productId(UUID.randomUUID().toString())
                .title(request.getTitle())
                .content(request.getContent())
                .overdueFee(request.getOverdueFee())
                .baseFee(request.getBaseFee())
                .feePerDay(request.getFeePerDay())
                .minimumRentalPeriod(request.getMinimumRentalPeriod())
                .totalRateCount(totalRateScore / (random.nextInt(totalRateScore - 5) + 5))
                .totalRateScore(totalRateScore)
                .viewCount(random.nextInt(5000))
                .latitude(member.getLatitude())
                .longitude(member.getLongitude())
                .address(member.getAddress())
                .member(member).build();

        // save시에 id를 기준으로 insert쿼리나 update쿼리를 생성해야하기 때문에 select를 먼저 실행한다.
        Product product = productRepository.save(productEntity);

        List<CategoryDto> productCategories =
                productCategoryService.createProductCategories(product, request.getCategoryIds());

        return CreateProduct.Response.from(product, productCategories);
    }

    private void validateOwner(Member member, Product product) {
        if (!member.getMemberId().equals(product.getMember().getMemberId())) {
            throw new BusinessLogicException(ExceptionCode.UNAUTHORIZED);
        }
    }

    @Transactional
    @CacheEvict(key = "#productId", value = "products")
    public UpdateProduct.Response updateProduct(UpdateProduct.Request request,
                                                String productId, Long memberId) {
        Member member = memberService.findMember(memberId);

        Product product = findProduct(productId);

        validateOwner(member, product);

        Optional.ofNullable(request.getBaseFee())
                .ifPresent(baseFee -> product.setBaseFee(baseFee));
        Optional.ofNullable(request.getTitle())
                .ifPresent(title -> product.setTitle(title));
        Optional.ofNullable(request.getContent())
                .ifPresent(content -> product.setContent(content));
        Optional.ofNullable(request.getFeePerDay())
                .ifPresent(feePerDay -> product.setFeePerDay(feePerDay));
        Optional.ofNullable(request.getOverdueFee())
                .ifPresent(overdueFee -> product.setOverdueFee(overdueFee));
        Optional.ofNullable(request.getMinimumRentalPeriod())
                .ifPresent(minimumRentalPeriod -> product.setMinimumRentalPeriod(minimumRentalPeriod));
        Optional.ofNullable(request.getCategoryIds())
                .ifPresent(categoryIds -> {
                    productCategoryService.deleteProductCategoriesByProductId(productId);
                    productCategoryService.createProductCategories(product, categoryIds);
                });

        return UpdateProduct.Response.from(product);
    }

    @Transactional
    @CacheEvict(key = "#productId", value = "products")
    public void deleteProduct(String productId, Long memberId) {
        Member member = memberService.findMember(memberId);

        Product product = findProduct(productId);

        validateOwner(member, product);

        productRepository.delete(product);
    }

    public Product findProduct(String productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new BusinessLogicException(PRODUCT_NOT_FOUND));
    }

    @Cacheable(key = "#productId", value = "products")
    public ProductDetailDto findProductDetail(String productId, Long memberId) {
        log.info("[ProductService] findProductDetail called");
        Product product = findProduct(productId);

        Member member = memberService.findMember(memberId);
        boolean isOwner = false;
        if (Objects.equals(member.getMemberId(), product.getMember().getMemberId())) {
            isOwner = true;
        }

        List<CategoryDto> categories = productCategoryService.findCategoriesByProductId(productId);

        List<String> images = imageService.findImageProduct(productId).stream()
                .map(image -> image.getImageUrl())
                .collect(Collectors.toList());

        String userImage = imageService.findImageMember(product.getMember().getMemberId()).getImageUrl();

        return ProductDetailDto.from(product, categories, images, null, isOwner);
    }

    public GetProducts findProducts(Long memberId, int size, int page) {
        Member member = memberService.findMember(memberId);

        Page<ProductDto> products = productRepository.findProductDtosByMemberId(memberId, PageRequest.of(page, size));

        return GetProducts.from(products);
    }

    @Transactional
    public void updateView(String productId) {
        Product product = findProduct(productId);
        product.setViewCount(product.getViewCount() + 1);
    }


    public List<Product> findProductByMemberId(Long memberId) {
        return productRepository.findAllByMemberMemberId(memberId);
    }

    public List<Product> getTop3ByViewCount() {
        return productRepository.findTop3ByOrderByViewCountDesc();
    }

    public List<Product> getTop3ByTotalRateScoreRatio() {
        //첫번째 페이지에서 3개의 product만 가져오도록
        int PAGE = 0;
        int SIZE = 3;

        return productRepository.findTop3ByOrderByTotalRateScoreRatioDesc(PageRequest.of(PAGE, SIZE));
    }

    public List<Product> getTop3ByBaseFeeZero(int baseFee) {
        return productRepository.findTop3ByBaseFeeOrderByCreatedAtDesc(0);
    }
}