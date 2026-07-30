import { SaleCommand, SaleRequest, ValidationResult } from "./types";

export const workflowSteps = [
    { stage: "Solicitação", label: "Solicitação" },
    { stage: "Gestor", label: "Gestor" },
    { stage: "Meio Ambiente", label: "Meio ambiente" },
    { stage: "Logística", label: "Logística" },
    { stage: "Fiscal", label: "Fiscal" },
    { stage: "Conclusão", label: "Conclusão" }
];

const requiredBase: (keyof SaleRequest)[] = [
    "Title",
    "Tipo",
    "Area",
    "Empresa",
    "UnidadePlanta",
    "ModalidadeVenda",
    "Prioridade",
    "ValorEstimadoTotal",
    "ParecerTecnico"
];

const labels: Partial<Record<keyof SaleRequest, string>> = {
    Title: "Identificação do ativo",
    Tipo: "Tipo",
    Area: "Área",
    Empresa: "Empresa",
    UnidadePlanta: "Unidade/planta",
    ModalidadeVenda: "Modalidade de venda",
    Prioridade: "Prioridade",
    ValorEstimadoTotal: "Valor estimado",
    ParecerTecnico: "Parecer técnico",
    NumeroOVSAP: "Número da OV SAP",
    NumeroNF: "Número da nota fiscal",
    ValorFinalVenda: "Valor final da venda",
    ClienteComprador: "Cliente comprador",
    FormularioBaixaCoA: "Formulário de baixa CoA"
};

export function validateRequest(request: SaleRequest, command?: SaleCommand): ValidationResult {
    const errors: Record<string, string> = {};
    const required = [...requiredBase];

    if (command === "completeFiscal") {
        required.push("NumeroOVSAP", "NumeroNF");
    }

    if (command === "conclude") {
        required.push("ValorFinalVenda", "ClienteComprador", "FormularioBaixaCoA");
    }

    required.forEach((field) => {
        const value = request[field];
        const empty = value === undefined || value === null || (typeof value === "string" && value.trim() === "");
        if (empty) {
            errors[field] = `${labels[field] ?? field} é obrigatório.`;
        }
    });

    if ((request.ValorEstimadoTotal ?? 0) < 0) {
        errors.ValorEstimadoTotal = "O valor estimado não pode ser negativo.";
    }

    if ((request.ValorFinalVenda ?? 0) < 0) {
        errors.ValorFinalVenda = "O valor final não pode ser negativo.";
    }

    if (request.FormularioBaixaCoA) {
        try {
            const url = new URL(request.FormularioBaixaCoA);
            if (!["http:", "https:"].includes(url.protocol)) throw new Error();
        } catch {
            errors.FormularioBaixaCoA = "Informe uma URL HTTP ou HTTPS válida.";
        }
    }

    return { valid: Object.keys(errors).length === 0, errors };
}

export function stageIndex(stage: string): number {
    const index = workflowSteps.findIndex((step) => step.stage === stage);
    return index < 0 ? 0 : index;
}

export function commandLabel(command: SaleCommand): string {
    const labelsByCommand: Record<SaleCommand, string> = {
        create: "Salvar rascunho",
        update: "Salvar alterações",
        submit: "Enviar para aprovação",
        approveManager: "Aprovar como gestor",
        rejectManager: "Rejeitar como gestor",
        approveEnvironment: "Aprovar meio ambiente",
        rejectEnvironment: "Rejeitar meio ambiente",
        completeLogistics: "Concluir logística",
        completeFiscal: "Concluir fiscal",
        conclude: "Concluir venda",
        cancel: "Cancelar solicitação"
    };
    return labelsByCommand[command];
}
