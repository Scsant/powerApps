import { ChoiceConfig, PermissionConfig, PersonValue, SaleCommand, SaleRequest } from "./types";

export const defaultChoices: ChoiceConfig = {
    Tipo: ["Equipamento", "Veículo", "Mobiliário", "Sucata", "Material excedente", "Outro"],
    Status: [
        "Rascunho",
        "Aguardando aprovação do gestor",
        "Aguardando aprovação do meio ambiente",
        "Em logística",
        "Em faturamento",
        "Aguardando conclusão",
        "Concluída",
        "Rejeitada",
        "Cancelada"
    ],
    Empresa: [],
    ModalidadeVenda: ["Venda direta", "Leilão", "Concorrência", "Alienação para sucata"],
    EtapaAtual: ["Solicitação", "Gestor", "Meio Ambiente", "Logística", "Fiscal", "Conclusão"],
    Prioridade: ["Baixa", "Normal", "Alta", "Urgente"],
    StatusAprovGestor: ["Pendente", "Aprovado", "Devolvido para ajuste", "Rejeitado"],
    StatusAprovMeioAmbiente: ["Pendente", "Aprovado", "Devolvido para ajuste", "Rejeitado"],
    StatusLogistica: ["Não iniciada", "Em planejamento", "Agendada", "Concluída", "Bloqueada"],
    StatusFiscalNF: ["Não iniciado", "Aguardando OV", "OV criada", "NF emitida", "Concluído", "Bloqueado"]
};

export const emptyRequest: SaleRequest = {
    Title: "",
    Tipo: "",
    Status: "Rascunho",
    DataSolicitacao: "",
    Area: "",
    Empresa: "",
    UnidadePlanta: "",
    ModalidadeVenda: "",
    EtapaAtual: "Solicitação",
    Prioridade: "Normal",
    ClienteComprador: "",
    StatusAprovGestor: "Pendente",
    DataAprovGestor: "",
    ComentarioGestor: "",
    StatusAprovMeioAmbiente: "Pendente",
    DataAprovMeioAmbiente: "",
    ComentarioMeioAmbiente: "",
    StatusLogistica: "Não iniciada",
    StatusFiscalNF: "Não iniciado",
    NumeroOVSAP: "",
    NumeroNF: "",
    ParecerTecnico: "",
    FormularioBaixaCoA: "",
    DataConclusao: "",
    ObservacoesFinais: ""
};

export const defaultPermissions: PermissionConfig = {
    actions: ["create", "submit"],
    canEdit: true,
    canViewAudit: true
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
    if (!value?.trim()) {
        return fallback;
    }

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

function strings(value: unknown, fallback: string[]): string[] {
    if (!Array.isArray(value)) {
        return fallback;
    }

    return value
        .map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object" && "Value" in item) {
                return String((item as { Value: unknown }).Value);
            }
            return "";
        })
        .filter(Boolean);
}

export function parseRecord(value: string | null | undefined): SaleRequest {
    const parsed = parseJson<Partial<SaleRequest>>(value, {});
    return { ...emptyRequest, ...parsed };
}

export function parseChoices(value: string | null | undefined): ChoiceConfig {
    const parsed = parseJson<Partial<ChoiceConfig>>(value, {});
    return {
        Tipo: strings(parsed.Tipo, defaultChoices.Tipo),
        Status: strings(parsed.Status, defaultChoices.Status),
        Empresa: strings(parsed.Empresa, defaultChoices.Empresa),
        ModalidadeVenda: strings(parsed.ModalidadeVenda, defaultChoices.ModalidadeVenda),
        EtapaAtual: strings(parsed.EtapaAtual, defaultChoices.EtapaAtual),
        Prioridade: strings(parsed.Prioridade, defaultChoices.Prioridade),
        StatusAprovGestor: strings(parsed.StatusAprovGestor, defaultChoices.StatusAprovGestor),
        StatusAprovMeioAmbiente: strings(
            parsed.StatusAprovMeioAmbiente,
            defaultChoices.StatusAprovMeioAmbiente
        ),
        StatusLogistica: strings(parsed.StatusLogistica, defaultChoices.StatusLogistica),
        StatusFiscalNF: strings(parsed.StatusFiscalNF, defaultChoices.StatusFiscalNF)
    };
}

export function parsePermissions(value: string | null | undefined): PermissionConfig {
    const parsed = parseJson<{
        actions?: unknown;
        canEdit?: boolean;
        canViewAudit?: boolean;
    }>(value, {});
    const knownActions: SaleCommand[] = [
        "create",
        "update",
        "submit",
        "approveManager",
        "rejectManager",
        "approveEnvironment",
        "rejectEnvironment",
        "completeLogistics",
        "completeFiscal",
        "conclude",
        "cancel"
    ];
    const actions = strings(parsed.actions, defaultPermissions.actions)
        .filter((action): action is SaleCommand => knownActions.includes(action as SaleCommand));

    return {
        actions,
        canEdit: parsed.canEdit ?? defaultPermissions.canEdit,
        canViewAudit: parsed.canViewAudit ?? defaultPermissions.canViewAudit
    };
}

export function parseCurrentUser(value: string | null | undefined): PersonValue | undefined {
    return parseJson<PersonValue | undefined>(value, undefined);
}

export function serializableRequest(request: SaleRequest): SaleRequest {
    const editable = { ...request };
    delete editable.ID;
    delete editable.Created;
    delete editable.Modified;
    delete editable.Author;
    delete editable.Editor;
    delete editable.Attachments;
    return editable;
}
