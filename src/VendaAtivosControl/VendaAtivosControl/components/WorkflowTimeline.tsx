import * as React from "react";
import { Check, Circle } from "lucide-react";
import { stageIndex, workflowSteps } from "../domain/workflow";

interface WorkflowTimelineProps {
    currentStage: string;
    status: string;
}

export const WorkflowTimeline = ({
    currentStage,
    status
}: WorkflowTimelineProps): React.ReactElement => {
    const current = stageIndex(currentStage);
    const closed = ["Concluída", "Rejeitada", "Cancelada"].includes(status);

    return (
        <aside className="va-timeline" aria-label="Etapas do processo">
            <div className="va-timeline-head">
                <span>Fluxo da solicitação</span>
                <strong>{status || "Rascunho"}</strong>
            </div>
            <ol>
                {workflowSteps.map((step, index) => {
                    const complete = index < current || (closed && status === "Concluída");
                    const active = index === current && !closed;
                    return (
                        <li
                            key={step.stage}
                            className={`${complete ? "is-complete" : ""} ${active ? "is-active" : ""}`}
                            aria-current={active ? "step" : undefined}
                        >
                            <span className="va-step-icon">
                                {complete ? <Check size={15} /> : <Circle size={13} />}
                            </span>
                            <span>{step.label}</span>
                        </li>
                    );
                })}
            </ol>
        </aside>
    );
};
