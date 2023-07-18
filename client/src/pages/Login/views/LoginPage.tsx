import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import useDecryptToken from '../../../common/utils/customHooks/useDecryptToken';
import KakaoLogin from '../components/KakaoLogin';
import { LoginPageContainer } from '../style';
import { ACCESS_TOKEN } from '../constants';

function LoginPage() {
  const decrypt = useDecryptToken();
  const encryptedAccessToken = localStorage.getItem(ACCESS_TOKEN);
  if (!encryptedAccessToken) {
    return null;
  }
  const accessToken = decrypt(encryptedAccessToken);
  const handleWithdrawal = () => {
    try {
      axios.delete(process.env.REACT_APP_API_URL + '/api/members', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error: AxiosError | any) {
      if (error.response.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요');
      }
    }
  };
  return (
    <LoginPageContainer>
      <KakaoLogin />
      <button onClick={handleWithdrawal}>회원탈퇴 임시 버튼</button>
    </LoginPageContainer>
  );
}
export default LoginPage;
