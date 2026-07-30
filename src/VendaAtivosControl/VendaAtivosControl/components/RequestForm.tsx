import * as React from "react";
import { Building2, ClipboardCheck, FileText, Landmark, MapPin, Truck } from "lucide-react";
import { ChoiceConfig, SaleRequest } from "../domain/types";

interface RequestFormProps {
    value: SaleRequest;
    choices: ChoiceConfig;
    errors: Record<string, string>;
    disabled: boolean;
    onChange: (value: SaleRequest) => void;
}

interface FieldProps {
    label: string;
    name: keyof SaleRequest;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}

function textValue(value: SaleRequest[keyof SaleRequest]): string {
    return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

const Field = ({ label, name, error, required, children }: FieldProps): React.ReactElement => (
    <div className="va-field">
        <label htmlFor={`va-${name}`}>
            {label}
            {required && <span aria-hidden="true"> *</span>}
        </label>
        {children}
        {error && (
            <span className="va-error" id={`va-${name}-error`} role="alert">
                {error}
            </span>
        )}
    </div>
);

const Section = ({
    icon,
    title,
    description,
    children
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}): React.ReactElement => (
    <section className="va-section">
        <div className="va-section-heading">
            <span className="va-section-icon">{icon}</span>
            <div>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
        </div>
        <div className="va-grid">{children}</div>
    </section>
);

export const RequestForm = ({
    value,
    choices,
    errors,
    disabled,
    onChange
}: RequestFormProps): React.ReactElement => {
    const set = (field: keyof SaleRequest, next: string | number | undefined): void => {
        onChange({ ...value, [field]: next });
    };

    const input = (
        field: keyof SaleRequest,
        label: string,
        required = false,
        type: "text" | "url" = "text"
    ): React.ReactElement => (
        <Field label={label} name={field} error={errors[field]} required={required}>
            <input
                id={`va-${field}`}
                type={type}
                value={textValue(value[field])}
                disabled={disabled}
                aria-invalid={Boolean(errors[field])}
                aria-describedby={errors[field] ? `va-${field}-error` : undefined}
                onChange={(event) => set(field, event.currentTarget.value)}
            />
        </Field>
    );

    const select = (
        field: keyof ChoiceConfig,
        label: string,
        required = false
    ): React.ReactElement => {
        const options = choices[field];
        if (options.length === 0) {
            return input(field as keyof SaleRequest, label, required);
        }

        return (
            <Field label={label} name={field as keyof SaleRequest} error={errors[field]} required={required}>
                <select
                    id={`va-${field}`}
                    value={String(value[field] ?? "")}
                    disabled={disabled}
                    aria-invalid={Boolean(errors[field])}
                    onChange={(event) => set(field as keyof SaleRequest, event.currentTarget.value)}
                >
                    <option value="">Selecione</option>
                    {options.map((option) => (
                        <option value={option} key={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </Field>
        );
    };

    const currency = (field: "ValorEstimadoTotal" | "ValorFinalVenda", label: string, required = false): React.ReactElement => (
        <Field label={label} name={field} error={errors[field]} required={required}>
            <div className="va-currency">
                <span>R$</span>
                <input
                    id={`va-${field}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={value[field] ?? ""}
                    disabled={disabled}
                    aria-invalid={Boolean(errors[field])}
                    onChange={(event) =>
                        set(field, event.currentTarget.value === "" ? undefined : Number(event.currentTarget.value))
                    }
                />
            </div>
        </Field>
    );

    const textarea = (field: keyof SaleRequest, label: string, required = false): React.ReactElement => (
        <Field label={label} name={field} error={errors[field]} required={required}>
            <textarea
                id={`va-${field}`}
                rows={4}
                value={textValue(value[field])}
                disabled={disabled}
                aria-invalid={Boolean(errors[field])}
                onChange={(event) => set(field, event.currentTarget.value)}
            />
        </Field>
    );

    return (
        <div className="va-form">
            <Section
                icon={<FileText size={20} />}
                title="Identificação do ativo"
                description="Dados principais da solicitação de venda."
            >
                {input("Title", "Identificação ou título do ativo", true)}
                {select("Tipo", "Tipo", true)}
                {select("Prioridade", "Prioridade", true)}
                {input("Area", "Área solicitante", true)}
                {textarea("ParecerTecnico", "Descrição e parecer técnico", true)}
            </Section>

            <Section
                icon={<MapPin size={20} />}
                title="Localização"
                description="Empresa e unidade onde o ativo está localizado."
            >
                {select("Empresa", "Empresa", true)}
                {input("UnidadePlanta", "Unidade / planta", true)}
            </Section>

            <Section
                icon={<Landmark size={20} />}
                title="Venda e valores"
                description="Modalidade, estimativas e comprador."
            >
                {select("ModalidadeVenda", "Modalidade de venda", true)}
                {currency("ValorEstimadoTotal", "Valor estimado total", true)}
                {input("ClienteComprador", "Cliente comprador")}
                {currency("ValorFinalVenda", "Valor final da venda")}
            </Section>

            <Section
                icon={<ClipboardCheck size={20} />}
                title="Aprovações"
                description="Pareceres registrados durante o fluxo."
            >
                {select("StatusAprovGestor", "Status do gestor")}
                {textarea("ComentarioGestor", "Comentário do gestor")}
                {select("StatusAprovMeioAmbiente", "Status de meio ambiente")}
                {textarea("ComentarioMeioAmbiente", "Comentário de meio ambiente")}
            </Section>

            <Section
                icon={<Truck size={20} />}
                title="Logística e fiscal"
                description="Retirada, ordem de venda e nota fiscal."
            >
                {select("StatusLogistica", "Status da logística")}
                {select("StatusFiscalNF", "Status fiscal / NF")}
                {input("NumeroOVSAP", "Número da OV SAP")}
                {input("NumeroNF", "Número da nota fiscal")}
            </Section>

            <Section
                icon={<Building2 size={20} />}
                title="Conclusão"
                description="Documentos e observações finais."
            >
                {input("FormularioBaixaCoA", "URL do formulário de baixa CoA", false, "url")}
                {textarea("ObservacoesFinais", "Observações finais")}
            </Section>
        </div>
    );
};
