import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { VendaAtivosApp } from "./components/VendaAtivosApp";
import { CommandPayload, ControlMode, OperationResult } from "./domain/types";
import {
    parseChoices,
    parseCurrentUser,
    parsePermissions,
    parseRecord
} from "./domain/sharePointSchema";

export class VendaAtivosControl implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged!: () => void;
    private outputs: IOutputs = {
        command: "",
        commandId: "",
        submissionJson: "",
        isDirty: false,
        isValid: false
    };

    public init(
        _context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        _state: ComponentFramework.Dictionary
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const recordJson = context.parameters.recordJson.raw ?? "";
        const operationResultJson = context.parameters.operationResultJson.raw ?? "";
        let operationResult: OperationResult | undefined;

        if (operationResultJson) {
            try {
                operationResult = JSON.parse(operationResultJson) as OperationResult;
            } catch {
                operationResult = {
                    commandId: "",
                    success: false,
                    message: "O Canvas App retornou um resultado inválido."
                };
            }
        }

        return React.createElement(VendaAtivosApp, {
            mode: (context.parameters.mode.raw ?? "create") as ControlMode,
            record: parseRecord(recordJson),
            recordVersion: recordJson,
            choices: parseChoices(context.parameters.choiceConfigJson.raw),
            currentUser: parseCurrentUser(context.parameters.currentUserJson.raw),
            permissions: parsePermissions(context.parameters.permissionsJson.raw),
            operationResult,
            allocatedWidth: context.mode.allocatedWidth,
            onEmit: this.handleEmit
        });
    }

    private handleEmit = (payload: CommandPayload): void => {
        this.outputs = {
            command: payload.command,
            commandId: payload.commandId,
            submissionJson: payload.submissionJson,
            isDirty: payload.isDirty,
            isValid: payload.isValid
        };
        this.notifyOutputChanged();
    };

    public getOutputs(): IOutputs {
        return this.outputs;
    }

    public destroy(): void {
        // React virtual controls are disposed by the framework.
    }
}
