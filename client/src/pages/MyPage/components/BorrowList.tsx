import { useState, useEffect } from 'react';
import Paging from './Paging';
import axios from 'axios';
import { BorrowWrapper, BorrowCardWrapper } from '../style';
import { DefaultBtn } from '../../../common/components/Button';
import { colorPalette } from '../../../common/utils/enum/colorPalette';
import useDecryptToken from '../../../common/utils/customHooks/useDecryptToken';
import { ACCESS_TOKEN } from '../../Login/constants';
import BorrowCard from '../../../common/components/MypageCard/BorrowCard';
interface borrowCardProps {
  reservationId: string;
  title: string;
  image: string;
  status: string;
  startDate: string;
  endDate: string;
}
function BorrowList() {
  const decrypt = useDecryptToken();
  const [items, setItems] = useState<borrowCardProps[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(9);
  const [totalItemsCount, setTotalItemsCount] = useState(currentPage);
  const [currentStatus, setCurrentStatus] = useState('REQUESTED');
  const totalPages = Math.ceil(totalItemsCount / itemsPerPage);

  // 페이지 번호를 인수로 받아 해당 페이지에 해당하는 데이터를 가져오는 방식
  useEffect(() => {
    fetchItemsForPage(currentPage, currentStatus);
  }, [currentPage, currentStatus]);

  //  페이지 번호나 상태가 변경될 때마다 데이터를 가져오는 함수
  const fetchItemsForPage = async (page: number, status: string) => {
    const encryptedAccessToken: string | null =
      localStorage.getItem(ACCESS_TOKEN) || '';
    const accessToken = decrypt(encryptedAccessToken);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/reservations`,
        {
          params: {
            size: itemsPerPage,
            page: currentPage,
            status: currentStatus,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setItems(response.data.reservations);
      setTotalItemsCount(response.data.pageInfo.totalElements);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  //  items 상태가 변경될 때마다 렌더링 될 아이템들을 출력
  useEffect(() => {
    console.log(items);
  }, [items]);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleReservationRequest = () => {
    setCurrentStatus('REQUESTED');
    setCurrentPage(0);
  };
  const handleReservedItems = () => {
    setCurrentStatus('RESERVED');
    setCurrentPage(0);
  };
  const handleInUseItems = () => {
    setCurrentStatus('INUSE');
    setCurrentPage(0);
  };

  const handleCompletedItems = () => {
    setCurrentStatus('COMPLETED');
    setCurrentPage(0);
  };

  const handleCanceledItems = () => {
    setCurrentStatus('CANCELED');
    setCurrentPage(0);
  };

  return (
    <div>
      <BorrowWrapper>
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
          onClick={handleInUseItems}
        >
          사용중인 플레이팩
        </DefaultBtn>
        <DefaultBtn
          color={colorPalette.deepMintColor}
          backgroundColor={colorPalette.whiteColor}
          onClick={handleCompletedItems}
        >
          사용 완료한 플레이팩
        </DefaultBtn>
        <DefaultBtn
          color={colorPalette.deepMintColor}
          backgroundColor={colorPalette.whiteColor}
          onClick={handleCanceledItems}
        >
          예약취소내역
        </DefaultBtn>
      </BorrowWrapper>
      <BorrowCardWrapper>
        {items.map((item, index) => (
          <BorrowCard key={index} borrowCardData={item} />
        ))}
      </BorrowCardWrapper>
      <Paging
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        totalItemsCount={totalItemsCount}
        totalPages={totalPages}
      />
    </div>
  );
}
export default BorrowList;
