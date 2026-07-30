import * as React from "react";
import { Ban, CheckCircle2, Save, Send, XCircle } from "lucide-react";
import { SaleCommand } from "../domain/types";
import { commandLabel } from "../domain/workflow";

interface ActionPanelProps {
    actions: SaleCommand[];
    valid: boolean;
    busy: boolean;
    onCommand: (command: SaleCommand) => void;
}

const destructive: SaleCommand[] = ["rejectManager", "rejectEnvironment", "cancel"];
const approvals: SaleCommand[] = [
    "approveManager",
    "approveEnvironment",
    "completeLogistics",
    "completeFiscal",
    "conclude"
];

function icon(command: SaleCommand): React.ReactNode {
    if (command === "create" || command === "update") return <Save size={17} />;
    if (command === "submit") return <Send size={17} />;
    if (command === "cancel") return <Ban size={17} />;
    if (destructive.includes(command)) return <XCircle size={17} />;
    return <CheckCircle2 size={17} />;
}

export const ActionPanel = ({
    actions,
    valid,
    busy,
    onCommand
}: ActionPanelProps): React.ReactElement | null => {
    if (actions.length === 0) return null;

    return (
        <footer className="va-actions">
            <span className="va-actions-hint">
                <CheckCircle2 size={16} />
                {valid ? "Dados prontos para envio" : "Revise os campos obrigatórios"}
            </span>
            <div>
                {actions.map((command) => {
                    const needsValid = command === "submit" || approvals.includes(command);
                    const className = destructive.includes(command)
                        ? "va-btn va-btn-danger"
                        : command === "submit" || approvals.includes(command)
                            ? "va-btn va-btn-primary"
                            : "va-btn va-btn-secondary";
                    return (
                        <button
                            type="button"
                            className={className}
                            key={command}
                            disabled={busy || (needsValid && !valid)}
                            onClick={() => onCommand(command)}
                        >
                            {icon(command)}
                            {commandLabel(command)}
                        </button>
                    );
                })}
            </div>
        </footer>
    );
};
