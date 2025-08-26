import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Home, AlertTriangle, Headphones } from 'lucide-react';

const TokenPaymentFail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  const getErrorDetails = (code: string | null) => {
    switch (code) {
      case 'INVALID_CARD_NUMBER':
        return {
          title: '카드 번호 오류',
          description: '입력하신 카드 번호를 확인해 주세요.',
          suggestion: '카드 번호를 다시 확인하고 재시도해 주세요.'
        };
      case 'INSUFFICIENT_FUNDS':
        return {
          title: '잔액 부족',
          description: '카드 잔액이 부족합니다.',
          suggestion: '다른 결제 수단을 이용하거나 잔액을 확인해 주세요.'
        };
      case 'EXPIRED_CARD':
        return {
          title: '카드 만료',
          description: '카드 유효기간이 만료되었습니다.',
          suggestion: '다른 카드를 이용해 주세요.'
        };
      case 'USER_CANCELED':
        return {
          title: '결제 취소',
          description: '사용자가 결제를 취소했습니다.',
          suggestion: '다시 결제를 진행해 주세요.'
        };
      default:
        return {
          title: '결제 실패',
          description: errorMessage || '알 수 없는 오류가 발생했습니다.',
          suggestion: '잠시 후 다시 시도해 주세요.'
        };
    }
  };

  const errorDetails = getErrorDetails(errorCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <XCircle className="h-16 w-16 text-red-600" />
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold text-slate-900 mb-2">
            결제 실패
          </CardTitle>
          <CardDescription className="text-lg text-slate-600">
            토큰 충전 중 문제가 발생했습니다.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 오류 정보 */}
          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {errorDetails.title}
            </h3>
            <p className="text-red-800 mb-3">{errorDetails.description}</p>
            <p className="text-sm text-red-700">{errorDetails.suggestion}</p>
          </div>

          {/* 오류 상세 정보 (개발용) */}
          {(errorCode || errorMessage) && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">오류 상세 정보</h4>
              <div className="space-y-1 text-sm text-slate-600">
                {errorCode && (
                  <div>
                    <span className="font-medium">오류 코드:</span>
                    <span className="ml-2 font-mono bg-white px-2 py-1 rounded border text-xs">
                      {errorCode}
                    </span>
                  </div>
                )}
                {errorMessage && (
                  <div>
                    <span className="font-medium">오류 메시지:</span>
                    <span className="ml-2">{errorMessage}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 해결 방법 안내 */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">💡 해결 방법</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>카드 정보를 다시 확인하고 재시도해 보세요</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>다른 결제 수단을 이용해 보세요</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>잠시 후 다시 시도해 보세요</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>문제가 지속되면 고객지원팀에 문의해 주세요</span>
              </li>
            </ul>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold"
              onClick={() => navigate('/token-subscription')}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              다시 시도하기
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 py-3 text-base"
              onClick={() => navigate('/')}
            >
              <Home className="w-5 h-5 mr-2" />
              홈으로 이동
            </Button>
          </div>

          {/* 고객 지원 */}
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 mb-3">
              문제가 해결되지 않으시나요?
            </p>
            <Button 
              variant="outline" 
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Headphones className="w-4 h-4 mr-2" />
              고객 지원센터
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenPaymentFail;