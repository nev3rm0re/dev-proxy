import type { Request } from "express";
import type { ServerResponse } from "http";
import type { OpenAPIV3 } from "openapi-types";
import type { ParsedQs } from "qs";
import type { IncomingHttpHeaders } from "http";

interface Example {
  timestamp: number;
  request: {
    headers: IncomingHttpHeaders;
    body: unknown;
    query: ParsedQs;
  };
  response: {
    status: string;
    headers: Record<string, string | string[] | number | undefined>;
    body: unknown;
  };
}

interface ResponseExample {
  timestamp: number;
  body: unknown;
}

interface ExtendedOperationObject extends OpenAPIV3.OperationObject {
  "x-examples"?: Example[];
}

interface ExtendedResponseObject extends OpenAPIV3.ResponseObject {
  "x-response-examples"?: ResponseExample[];
}

interface ExtendedDocument extends OpenAPIV3.Document {
  "x-timestamp"?: string;
}

interface ExtendedResponse extends Response {
  responseBody?: unknown;
}

export class OpenAPIRecorder {
  private paths: Record<string, Record<string, ExtendedOperationObject>> = {};

  recordRequest(
    req: Request,
    res: ServerResponse | Response,
    startTime: number
  ) {
    const path = this.normalizePath(req.path);
    const method = req.method.toLowerCase();

    if (!this.paths[path]) {
      this.paths[path] = {};
    }

    if (!this.paths[path][method]) {
      this.paths[path][method] = {
        summary: `${method.toUpperCase()} ${path}`,
        parameters: [],
        responses: {},
        "x-examples": [], // Custom field to store multiple examples
      };
    }

    // Update response handling to work with both types
    const responseBody =
      "responseBody" in res
        ? (res as ExtendedResponse).responseBody
        : (res as ExtendedResponse).responseBody;
    const responseHeaders =
      "getHeaders" in res ? res.getHeaders() : res.headers;
    const statusCode = (res as ServerResponse).statusCode?.toString() || "200";

    const requestExample: Example = {
      timestamp: startTime,
      request: {
        headers: req.headers,
        body: req.body,
        query: req.query,
      },
      response: {
        status: statusCode,
        headers: responseHeaders as Record<
          string,
          string | string[] | number | undefined
        >,
        body: responseBody,
      },
    };

    // Add to examples array
    this.paths[path][method]["x-examples"]?.push(requestExample);

    // Update the response schema if needed
    if (!this.paths[path][method].responses[statusCode]) {
      const responseObj: ExtendedResponseObject = {
        description: `${statusCode} response`,
        content: {
          "application/json": {
            schema: this.inferSchema(responseBody),
          },
        },
        "x-response-examples": [],
      };
      this.paths[path][method].responses[statusCode] = responseObj;
    }

    // Add response example
    (
      (
        this.paths[path][method].responses[statusCode] as ExtendedResponseObject
      )["x-response-examples"] || []
    ).push({
      timestamp: startTime,
      body: responseBody,
    });

    // Update parameters based on request
    this.updateParameters(this.paths[path][method], req);
  }

  private updateParameters(operation: ExtendedOperationObject, req: Request) {
    // Query parameters
    Object.entries(req.query).forEach(([name, value]) => {
      if (
        !operation.parameters?.some(
          (p) => !("$ref" in p) && p.in === "query" && p.name === name
        )
      ) {
        operation.parameters = operation.parameters || [];
        operation.parameters.push({
          name,
          in: "query",
          schema: {
            type: typeof value === "string" ? "string" : "object",
          },
        });
      }
    });

    // Path parameters
    const pathParams = req.params;
    Object.keys(pathParams).forEach((name) => {
      if (
        !operation.parameters?.some(
          (p) => !("$ref" in p) && p.in === "path" && p.name === name
        )
      ) {
        operation.parameters = operation.parameters || [];
        operation.parameters.push({
          name,
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
        });
      }
    });

    // Headers
    Object.keys(req.headers).forEach((name) => {
      if (
        !operation.parameters?.some(
          (p) => !("$ref" in p) && p.in === "header" && p.name === name
        )
      ) {
        operation.parameters = operation.parameters || [];
        operation.parameters.push({
          name,
          in: "header",
          schema: {
            type: "string",
          },
        });
      }
    });
  }

  private normalizePath(path: string): string {
    // Convert path parameters to OpenAPI format
    return path.replace(/\/([^/]+)/g, (match, param) => {
      if (/^\d+$/.test(param)) {
        return "/{id}";
      }
      return match;
    });
  }

  private inferSchema(data: unknown): OpenAPIV3.SchemaObject {
    if (data === null || data === undefined) {
      return { type: "object", nullable: true };
    }

    const type = typeof data;
    switch (type) {
      case "string":
        return { type: "string" };
      case "number":
        return { type: "number" };
      case "boolean":
        return { type: "boolean" };
      case "object": {
        if (Array.isArray(data)) {
          return {
            type: "array",
            items:
              data.length > 0 ? this.inferSchema(data[0]) : { type: "object" },
          };
        }
        const properties: Record<string, OpenAPIV3.SchemaObject> = {};
        for (const [key, value] of Object.entries(data)) {
          properties[key] = this.inferSchema(value);
        }
        return {
          type: "object",
          properties,
        };
      }
    }
    return { type: "object" };
  }

  getSpec(): ExtendedDocument {
    return {
      openapi: "3.0.0",
      info: {
        title: "API Documentation",
        version: "1.0.0",
      },
      paths: this.paths,
      "x-timestamp": new Date().toISOString(),
    };
  }
}
