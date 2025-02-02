import { useState, useEffect } from 'react';
import Paging from './Paging';
import axios from 'axios';
import { WishListWrapper } from '../style';
import ItemCard from '../../../common/components/ItemCard/ItemCard';

function WishList() {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); //현재페이지
  const [itemsPerPage] = useState(3);
  const [totalItemsCount, setTotalItemsCount] = useState(currentPage);
  const totalPages = Math.ceil(totalItemsCount / itemsPerPage);

  useEffect(() => {
    fetchItemsForPage(currentPage);
    // 페이지 번호를 인수로 받아 해당 페이지에 해당하는 데이터를 가져오는 방식
  }, [currentPage]);
  const fetchItemsForPage = async (page: number) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/members/interests`,
        { params: { memberId: 1, page: currentPage, size: itemsPerPage } },
      );
      setItems(response.data.responses);
      setTotalItemsCount(response.data.listSize);

      console.log('currentPage:', currentPage);
      console.log('totalElements:', response.data);
      console.log('response:', response.data.responses);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <WishListWrapper>
      {/* {renderItems()} */}

      <div>
        {items.map((item, index) => (
          <ItemCard key={index} itemCardData={item} />
        ))}
      </div>
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

export default WishList;
