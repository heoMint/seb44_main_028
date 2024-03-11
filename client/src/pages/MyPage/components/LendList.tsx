import { useState, useEffect } from 'react';
import Paging from './Paging';
import axios from 'axios';
import { WishListWrapper, LendListWrapper, LendWrapper } from '../style';
import { DefaultBtn } from '../../../common/components/Button';
import { colorPalette } from '../../../common/utils/enum/colorPalette';
import LendCard from '../../../common/components/MypageCard/LendCard';
import useDecryptToken from '../../../common/utils/customHooks/useDecryptToken';
import { ACCESS_TOKEN } from '../../Login/constants';
import { lendCardProps } from '../../../common/type';

interface LendListProps {
  currentStatus: string;
  lendCardData: lendCardProps[];
}

function LendList({ lendCardData }: { lendCardData: lendCardProps }) {
  const decrypt = useDecryptToken();

  const [items, setItems] = useState<lendCardProps[]>([]);
  const [isItemCardClicked, setIsItemCardClicked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); //현재페이지
  const [currentStatus, setCurrentStatus] = useState(''); //현재상태
  const [itemsPerPage] = useState(3);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const totalPages = Math.ceil(totalItemsCount / itemsPerPage);

  // 여 페이지 번호나 상태가 변경될 때마다 데이터를 가져오는 함수
  const fetchItemsForPage = async (page: number) => {
    const encryptedAccessToken: string | null =
      localStorage.getItem(ACCESS_TOKEN) || '';
    const accessToken = decrypt(encryptedAccessToken);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/products/members`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      setItems(response.data.products);
      setTotalItemsCount(response.data.pageInfo.totalElements);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };
  console.log('items:', items);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchItemsForPage(currentPage);
    // 페이지 번호를 인수로 받아 해당 페이지에 해당하는 데이터를 가져오는 방식
  }, [currentPage]);

  const handleReservationRequest = () => {
    setCurrentStatus('REQUESTED');
    setCurrentPage(0);
  };
  const handleReservedItems = () => {
    setCurrentStatus('RESERVED');
    setCurrentPage(0);
  };

  const handleCompletedItems = () => {
    setCurrentStatus('COMPLETED');
    setCurrentPage(0);
  };
  const handleCanceledItems = () => {
    setCurrentStatus('CANCELED');
  };

  return (
    <WishListWrapper>
      {isItemCardClicked === true ? (
        <LendWrapper>
          <DefaultBtn
            color={colorPalette.deepMintColor}
            backgroundColor={colorPalette.whiteColor}
            onClick={handleReservationRequest}
          >
            예약요청
          </DefaultBtn>
          <DefaultBtn
            color={colorPalette.deepMintColor}
            backgroundColor={colorPalette.whiteColor}
            onClick={handleReservedItems}
          >
            예약확정
          </DefaultBtn>
          <DefaultBtn
            color={colorPalette.deepMintColor}
            backgroundColor={colorPalette.whiteColor}
            onClick={handleCanceledItems}
          >
            거절한 예약
          </DefaultBtn>
          <DefaultBtn
            color={colorPalette.deepMintColor}
            backgroundColor={colorPalette.whiteColor}
            onClick={handleCompletedItems}
          >
            지난예약
          </DefaultBtn>
        </LendWrapper>
      ) : null}
      <LendListWrapper>
        {items?.map((item, index) => (
          <LendCard
            key={index}
            lendCardData={item}
            isItemCardClicked={isItemCardClicked}
            setIsItemCardClicked={setIsItemCardClicked}
          />
        ))}
      </LendListWrapper>
      <div>
        <Paging
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItemsCount={totalItemsCount}
          totalPages={totalPages}
        />
      </div>
    </WishListWrapper>
  );
}

export default LendList;
