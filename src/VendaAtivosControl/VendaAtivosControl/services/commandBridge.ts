import { CommandPayload, SaleCommand, SaleRequest } from "../domain/types";
import { serializableRequest } from "../domain/sharePointSchema";
import { validateRequest } from "../domain/workflow";

function commandId(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createCommand(
    command: SaleCommand,
    request: SaleRequest,
    isDirty: boolean
): CommandPayload {
    const validation = validateRequest(request, command);
    return {
        command,
        commandId: commandId(),
        submissionJson: JSON.stringify(serializableRequest(request)),
        isDirty,
        isValid: validation.valid
    };
}
