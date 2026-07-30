import * as React from "react";
import { AlertCircle, CheckCircle2, PackageSearch, Paperclip, ShieldCheck, UserRound } from "lucide-react";
import {
    ChoiceConfig,
    CommandPayload,
    ControlMode,
    OperationResult,
    PermissionConfig,
    PersonValue,
    SaleCommand,
    SaleRequest
} from "../domain/types";
import { validateRequest } from "../domain/workflow";
import { createCommand } from "../services/commandBridge";
import { RequestForm } from "./RequestForm";
import { WorkflowTimeline } from "./WorkflowTimeline";
import { ActionPanel } from "./ActionPanel";

export interface VendaAtivosAppProps {
    mode: ControlMode;
    record: SaleRequest;
    recordVersion: string;
    choices: ChoiceConfig;
    currentUser?: PersonValue;
    permissions: PermissionConfig;
    operationResult?: OperationResult;
    allocatedWidth: number;
    onEmit: (payload: CommandPayload) => void;
}

function displayCurrency(value?: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value ?? 0);
}

export const VendaAtivosApp = (props: VendaAtivosAppProps): React.ReactElement => {
    const [request, setRequest] = React.useState<SaleRequest>(() => ({
        ...props.record,
        Solicitante: props.record.Solicitante ?? props.currentUser
    }));
    const [dirty, setDirty] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const [toast, setToast] = React.useState<OperationResult | undefined>(props.operationResult);

    React.useEffect(() => {
        setRequest({
            ...props.record,
            Solicitante: props.record.Solicitante ?? props.currentUser
        });
        setDirty(false);
    }, [props.recordVersion]);

    React.useEffect(() => {
        if (!props.operationResult) return;
        setToast(props.operationResult);
        setBusy(false);
        if (props.operationResult.success) setDirty(false);
    }, [props.operationResult?.commandId, props.operationResult?.success]);

    const validation = validateRequest(request);
    const disabled = props.mode === "view" || !props.permissions.canEdit || busy;

    const change = (next: SaleRequest): void => {
        setRequest(next);
        setDirty(true);
        setToast(undefined);
    };

    const send = (command: SaleCommand): void => {
        const commandValidation = validateRequest(request, command);
        const requiresValid = command !== "create" && command !== "update" && command !== "cancel";
        if (requiresValid && !commandValidation.valid) {
            setToast({
                commandId: "",
                success: false,
                message: "Revise os campos obrigatórios antes de continuar."
            });
            return;
        }

        const payload = createCommand(command, request, dirty);
        setBusy(true);
        setToast(undefined);
        props.onEmit(payload);
    };

    const widthClass = props.allocatedWidth < 640
        ? "is-mobile"
        : props.allocatedWidth < 1024
            ? "is-tablet"
            : "is-desktop";

    return (
        <main className={`va-root ${widthClass}`}>
            <header className="va-hero">
                <div className="va-brand">
                    <span className="va-brand-icon"><PackageSearch size={25} /></span>
                    <div>
                        <span className="va-eyebrow">GESTÃO DE ATIVOS</span>
                        <h1>{request.ID ? `Solicitação #${request.ID}` : "Nova solicitação de venda"}</h1>
                        <p>Cadastre o ativo e acompanhe todas as etapas até a conclusão.</p>
                    </div>
                </div>
                <div className="va-user">
                    <UserRound size={18} />
                    <span>
                        <strong>{props.currentUser?.displayName ?? "Usuário conectado"}</strong>
                        <small>{props.currentUser?.email ?? "Power Apps"}</small>
                    </span>
                </div>
            </header>

            <div className="va-kpis">
                <div>
                    <span>Valor estimado</span>
                    <strong>{displayCurrency(request.ValorEstimadoTotal)}</strong>
                </div>
                <div>
                    <span>Prioridade</span>
                    <strong>{request.Prioridade || "Normal"}</strong>
                </div>
                <div>
                    <span>Etapa atual</span>
                    <strong>{request.EtapaAtual || "Solicitação"}</strong>
                </div>
                <div>
                    <span>Governança</span>
                    <strong className="va-secure"><ShieldCheck size={17} /> SharePoint</strong>
                </div>
            </div>

            {toast && (
                <div className={`va-alert ${toast.success ? "is-success" : "is-error"}`} role="status">
                    {toast.success ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="va-layout">
                <RequestForm
                    value={request}
                    choices={props.choices}
                    errors={validation.errors}
                    disabled={disabled}
                    onChange={change}
                />
                <div className="va-side">
                    <WorkflowTimeline currentStage={request.EtapaAtual} status={request.Status} />
                    <section className="va-attachment-card">
                        <Paperclip size={20} />
                        <div>
                            <strong>Anexos</strong>
                            <p>
                                {request.ID
                                    ? "Use o painel de anexos do Canvas App para adicionar documentos."
                                    : "Salve a solicitação para liberar os anexos."}
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            <ActionPanel
                actions={props.permissions.actions}
                valid={validation.valid}
                busy={busy}
                onCommand={send}
            />
        </main>
    );
};
