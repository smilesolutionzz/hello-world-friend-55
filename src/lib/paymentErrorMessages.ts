/**
 * 결제 실패/취소/환불 시 사용자에게 보여줄 메시지 매핑.
 * 자동 재시도는 transient=true 인 경우에만 권장.
 */

export interface PaymentErrorInfo {
  title: string;
  description: string;
  /** 일시적 오류 — 자동 재시도 권장 */
  transient: boolean;
  /** 사용자 액션 제안 */
  action?: 'retry' | 'change_card' | 'contact_support' | 'check_network';
}

const RULES: Array<{ match: RegExp; info: PaymentErrorInfo }> = [
  {
    match: /(USER_CANCEL|PAY_PROCESS_CANCELED|취소)/i,
    info: {
      title: '결제를 취소하셨어요',
      description: '결제창을 닫으셨어요. 동일한 가격으로 다시 시작하실 수 있어요.',
      transient: false,
      action: 'retry',
    },
  },
  {
    match: /(EXCEED_MAX_AMOUNT|LIMIT|한도)/i,
    info: {
      title: '카드 한도 초과',
      description: '카드사 앱에서 한도를 확인하거나 다른 결제 수단으로 시도해 주세요.',
      transient: false,
      action: 'change_card',
    },
  },
  {
    match: /(INVALID_CARD|REJECT_CARD_COMPANY|카드사)/i,
    info: {
      title: '카드사 승인 거절',
      description: '카드사에서 승인을 거절했어요. 카드사 고객센터로 문의하거나 다른 카드로 시도해 주세요.',
      transient: false,
      action: 'change_card',
    },
  },
  {
    match: /(EXPIRED_CARD|만료|유효기간)/i,
    info: {
      title: '카드 유효기간 만료',
      description: '유효한 카드 정보로 다시 시도해 주세요.',
      transient: false,
      action: 'change_card',
    },
  },
  {
    match: /(NETWORK|TIMEOUT|GATEWAY_TIMEOUT|503|502)/i,
    info: {
      title: '네트워크 일시 오류',
      description: '잠시 후 자동으로 다시 시도할게요. 계속되면 Wi-Fi/데이터를 확인해 주세요.',
      transient: true,
      action: 'retry',
    },
  },
  {
    match: /(REFUND|환불)/i,
    info: {
      title: '환불 처리 안내',
      description: '환불 요청이 접수됐어요. 영업일 기준 3-5일 내 카드사로 환불됩니다.',
      transient: false,
      action: 'contact_support',
    },
  },
];

const DEFAULT_INFO: PaymentErrorInfo = {
  title: '결제가 완료되지 않았어요',
  description: '결제 정보는 저장되지 않았어요. 잠시 후 다시 시도해 주세요.',
  transient: true,
  action: 'retry',
};

export function mapPaymentError(codeOrMessage?: string | null): PaymentErrorInfo {
  if (!codeOrMessage) return DEFAULT_INFO;
  const text = String(codeOrMessage);
  for (const rule of RULES) {
    if (rule.match.test(text)) return rule.info;
  }
  return DEFAULT_INFO;
}

export const RETRY_BACKOFF_MS = [2000, 5000, 10000] as const;
export const MAX_AUTO_RETRIES = 2;
