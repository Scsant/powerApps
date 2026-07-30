export type ControlMode = "create" | "edit" | "view" | "approval";

export type SaleCommand =
    | "create"
    | "update"
    | "submit"
    | "approveManager"
    | "rejectManager"
    | "approveEnvironment"
    | "rejectEnvironment"
    | "completeLogistics"
    | "completeFiscal"
    | "conclude"
    | "cancel";

export interface PersonValue {
    displayName: string;
    email: string;
    claims?: string;
    department?: string;
    jobTitle?: string;
    picture?: string;
}

export interface SaleRequest {
    ID?: number;
    Title: string;
    Tipo: string;
    Status: string;
    DataSolicitacao: string;
    Solicitante?: PersonValue;
    Area: string;
    Empresa: string;
    UnidadePlanta: string;
    ModalidadeVenda: string;
    EtapaAtual: string;
    ResponsavelAtual?: PersonValue;
    Prioridade: string;
    ValorEstimadoTotal?: number;
    ValorFinalVenda?: number;
    ClienteComprador: string;
    StatusAprovGestor: string;
    AprovadorGestor?: PersonValue;
    DataAprovGestor: string;
    ComentarioGestor: string;
    StatusAprovMeioAmbiente: string;
    AprovadorMeioAmbiente?: PersonValue;
    DataAprovMeioAmbiente: string;
    ComentarioMeioAmbiente: string;
    StatusLogistica: string;
    StatusFiscalNF: string;
    NumeroOVSAP: string;
    NumeroNF: string;
    ParecerTecnico: string;
    FormularioBaixaCoA: string;
    DataConclusao: string;
    ObservacoesFinais: string;
    Created?: string;
    Modified?: string;
    Author?: PersonValue;
    Editor?: PersonValue;
    Attachments?: boolean;
}

export interface ChoiceConfig {
    Tipo: string[];
    Status: string[];
    Empresa: string[];
    ModalidadeVenda: string[];
    EtapaAtual: string[];
    Prioridade: string[];
    StatusAprovGestor: string[];
    StatusAprovMeioAmbiente: string[];
    StatusLogistica: string[];
    StatusFiscalNF: string[];
}

export interface PermissionConfig {
    actions: SaleCommand[];
    canEdit: boolean;
    canViewAudit: boolean;
}

export interface OperationResult {
    commandId: string;
    success: boolean;
    itemId?: number;
    message: string;
}

export interface ValidationResult {
    valid: boolean;
    errors: Record<string, string>;
}

export interface CommandPayload {
    command: SaleCommand;
    commandId: string;
    submissionJson: string;
    isDirty: boolean;
    isValid: boolean;
}
