import { useState } from "react";
import type { JwtPluginConfig } from "@/types/proxy";

interface JwtPluginProps {
  config?: JwtPluginConfig;
  onChange: (config: JwtPluginConfig) => void;
}

export const JwtPlugin = ({ config, onChange }: JwtPluginProps) => {
  const [jwtConfig, setJwtConfig] = useState<JwtPluginConfig>(
    config || {
      secret: "",
      kid: "",
      exp: 3600, // Default 1 hour
      additionalClaims: {},
      responseFormat: "raw", // Default is raw JWT
    }
  );

  const [claimKey, setClaimKey] = useState<string>("");
  const [claimValue, setClaimValue] = useState<string>("");

  const handleChange = (
    field: keyof JwtPluginConfig,
    value: string | number | boolean
  ) => {
    const newConfig = { ...jwtConfig, [field]: value };
    setJwtConfig(newConfig);
    onChange(newConfig);
  };

  const addClaim = () => {
    if (!claimKey.trim()) return;

    const newClaims = {
      ...jwtConfig.additionalClaims,
      [claimKey]: claimValue,
    };

    const newConfig = {
      ...jwtConfig,
      additionalClaims: newClaims,
    };

    setJwtConfig(newConfig);
    onChange(newConfig);
    setClaimKey("");
    setClaimValue("");
  };

  const removeClaim = (key: string) => {
    const newClaims = { ...jwtConfig.additionalClaims };
    delete newClaims[key];

    const newConfig = {
      ...jwtConfig,
      additionalClaims: newClaims,
    };

    setJwtConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">JWT Configuration</h3>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Secret Key</label>
        <input
          type="password"
          value={jwtConfig.secret}
          onChange={(e) => handleChange("secret", e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-blue-500"
          placeholder="JWT secret key"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Key ID (kid)</label>
        <input
          type="text"
          value={jwtConfig.kid || ""}
          onChange={(e) => handleChange("kid", e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-blue-500"
          placeholder="Optional: Key ID for JWK"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Expiration (seconds)
        </label>
        <input
          type="number"
          value={jwtConfig.exp}
          onChange={(e) => handleChange("exp", Number(e.target.value))}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-blue-500"
          placeholder="JWT expiration in seconds"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Response Format
        </label>
        <select
          value={jwtConfig.responseFormat || "raw"}
          onChange={(e) => handleChange("responseFormat", e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-blue-500"
        >
          <option value="raw">Raw JWT</option>
          <option value="json">JSON Object</option>
        </select>

        {jwtConfig.responseFormat === "json" && (
          <div className="mt-2">
            <label className="block text-sm text-gray-400 mb-1">
              JSON Property Name
            </label>
            <input
              type="text"
              value={jwtConfig.jsonProperty || "jwt"}
              onChange={(e) => handleChange("jsonProperty", e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-blue-500"
              placeholder="Property name (e.g. 'token' or 'jwt')"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">
          Additional Claims
        </label>

        <div className="grid grid-cols-3 gap-2 mb-2">
          <input
            type="text"
            value={claimKey}
            onChange={(e) => setClaimKey(e.target.value)}
            className="col-span-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-blue-500"
            placeholder="Claim name"
          />
          <input
            type="text"
            value={claimValue}
            onChange={(e) => setClaimValue(e.target.value)}
            className="col-span-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:outline-none focus:border-blue-500"
            placeholder="Claim value"
          />
          <button
            onClick={addClaim}
            className="col-span-1 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            Add
          </button>
        </div>

        <div className="mt-3">
          {Object.entries(jwtConfig.additionalClaims).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between bg-gray-800 rounded p-2 mb-2"
            >
              <div>
                <span className="text-blue-400">{key}:</span>{" "}
                <span className="text-white">{String(value)}</span>
              </div>
              <button
                onClick={() => removeClaim(key)}
                className="text-red-400 hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 p-3 rounded border border-gray-700">
        <h4 className="text-sm font-medium text-gray-400 mb-2">
          How to use in template
        </h4>
        <p className="text-gray-300 text-sm">
          {jwtConfig.responseFormat === "json"
            ? `Your response will be JSON with the JWT as the "${
                jwtConfig.jsonProperty || "jwt"
              }" property.`
            : `Use <code className="bg-gray-700 px-1 rounded">\${jwt}</code> in your response template to insert the generated JWT.`}
        </p>
      </div>
    </div>
  );
};
