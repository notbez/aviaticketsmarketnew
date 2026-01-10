export interface ReservationCreateRequest {
  offerId?: string;
  ContactPhone?: string;
  ContactEmails?: string[];
  RefuseToReceiveAutomaticRoundTripDiscountForRailwayTickets?: boolean;
  Customers: unknown[];
  ReservationItems: unknown[];
  CheckDoubleBooking?: boolean;
  PaymentRemark?: string;
  WaitListApplicationId?: number;
  PushNotificationUrl?: string;
}

export interface ReservationCreateResponse {
  OrderId: number;
  Amount: number;
  ConfirmTill: string;
  Customers: unknown[];
  ReservationResults: unknown[];
}

export interface ReservationRecalcRequest {
  
  OrderId: number;
}

export interface AviaRecalcResult {
  OrderItemId: number;
  Amount: number;
  Fare: number;
  Tax: number;
  ClientFeeCalculation?: {
    Charge: number;
    Profit: number;
  } | null;
  AgentFeeCalculation?: {
    Charge: number;
    Profit: number;
  } | null;
}

export interface ReservationRecalcResponse {
  OrderId: number;

  Customers: Array<{
    OrderCustomerId: number;
  }>;

  RecalcResults: AviaRecalcResult[];

  AmountBefore: number;
  AmountAfter: number;

  ClientFeeCalculationBefore?: {
    Charge: number;
    Profit: number;
  } | null;

  ClientFeeCalculationAfter?: {
    Charge: number;
    Profit: number;
  } | null;
}

export interface ReservationConfirmRequest {
  OrderId: number;
  OrderCustomerIds?: number[] | null;
  OrderCustomerDocuments?: OrderCustomerDocumentRequest[] | null;
  ProviderPaymentForm?: string | null;
  MaskedCardNumber?: string | null;
  AgentPaymentId?: string | null;
  PaymentMethod?: string | null;
  FasterPaymentsQrTId?: string | null;
  ProviderCustomerEmail?: string | null;
  PaymentRemark?: string | null;
}

export interface OrderCustomerDocumentRequest {
  OrderCustomerId: number;
  DocumentNumber?: string | null;
  DocumentType?: string | null;
  DocumentValidTill?: string | null;
  Citizenship?: string | null;
}

export interface ReservationConfirmResponse {
  OrderId: number;
  Customers: unknown[];
  ConfirmResults: unknown[];
}

export interface ReservationBlankRequest {
  OrderId: number;
  OrderItemId?: number | null;
  OrderItemIds?: number[] | null;
  RetrieveMainServices?: boolean;
  RetrieveUpsales?: boolean;
  BlankLanguage?: string | null;
}

export interface ReservationVoidRequest {
  OrderId: number;
  OrderItemIds?: number[] | null;
  OrderCustomerIds?: number[] | null;
}

export interface ReservationVoidResponse {
  OrderId: number;
}

export interface ReservationCancelRequest {
  OrderId: number;
  OrderItemIds?: number[] | null;
  OrderCustomerIds?: number[] | null;
}

export interface OrderInfoRequest {
  OrderId: number;
  AgentReferenceId?: string | null;
  ReservNumber?: string | null;
}

export interface OrderInfoResponse {
  WaitListApplicationId: number | null;
  PushNotificationUrl: string | null;
  OrderCustomers: unknown[] | null;
  OrderItems: unknown[] | null;
  RegistryScheme: number;
  OrderId: number;
  Amount: number;
  ContactPhone: string | null;
  ContactEmails: string[] | null;
  Created: string;
  Confirmed: string | null;
  PosSysName: string | null;
  PartnerType: string | null;
  RelatedOrderId: number | null;
}

export interface OrderListRequest {
  Date: string;
  OperationType?: string | null;
  ProviderPaymentForm?: string | null;
  IsExternallyLoaded?: boolean | null;
  PageOption?: unknown | null;
}

export interface OrderListResponse {
  Orders: unknown[];
  TotalQuantity: number;
}