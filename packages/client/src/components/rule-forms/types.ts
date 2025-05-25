export interface BaseRuleFormData {
  name: string;
  method: string | string[];
  pathPattern: string;
  isActive: boolean;
  isTerminating: boolean;
  order: number;
  description?: string;
}

export interface BaseRuleFormProps {
  formData: BaseRuleFormData;
  onChange: (data: Partial<BaseRuleFormData>) => void;
  errors: Record<string, string>;
}

export interface StaticRuleFormData extends BaseRuleFormData {
  type: "static";
  responseStatus: number;
  responseBody: string;
  responseHeaders?: Record<string, string>;
}

export interface ForwardingRuleFormData extends BaseRuleFormData {
  type: "forwarding";
  targetUrl: string;
  // Remove response status - it should pass through from upstream
}

export interface RequestModifierRuleFormData extends BaseRuleFormData {
  type: "request-modifier";
  requestModifications: Record<string, unknown>;
  // This rule type modifies requests before passing to other rules (non-terminating by default)
}

export interface ResponseModifierRuleFormData extends BaseRuleFormData {
  type: "response-modifier";
  responseModifications: Record<string, unknown>;
  conditionalRules?: Array<{
    condition: string;
    modifications: Record<string, unknown>;
  }>;
  // This rule type augments responses from various sources
}

export interface PluginRuleFormData extends BaseRuleFormData {
  type: "plugin";
  pluginType: string;
  responseStatus: number;
  responseTemplate?: string;
  pluginConfig: Record<string, unknown>;
}

export type RuleFormData =
  | StaticRuleFormData
  | ForwardingRuleFormData
  | RequestModifierRuleFormData
  | ResponseModifierRuleFormData
  | PluginRuleFormData;
