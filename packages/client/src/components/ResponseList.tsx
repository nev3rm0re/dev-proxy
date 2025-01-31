import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { ProxyEvent, ProxyResponse } from '@/types/proxy';
import { LockButton } from './ui/lock-button';
import CodeMirror from '@uiw/react-codemirror';
import { vim } from '@replit/codemirror-vim';
import { json } from '@codemirror/lang-json';
import { basicSetup } from '@uiw/codemirror-extensions-basic-setup';

interface ResponseListProps {
  route: ProxyEvent;
  responses: ProxyResponse[];
  method: string;
  onLockResponse: (responseId: string) => void;
  onEditResponse: (responseId: string, newBody: string) => void;
}

export const ResponseList: React.FC<ResponseListProps> = ({ responses, method, onLockResponse, onEditResponse }) => {
  const [expandedResponseId, setExpandedResponseId] = useState<string | null>(null);
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);

  const handleToggleExpand = (responseId: string) => {
    setExpandedResponseId(expandedResponseId === responseId ? null : responseId);
  };

  const handleEditResponse = (responseId: string) => {
    setEditingResponseId(responseId);
  };

  const handleSaveEdit = (responseId: string, newBody: string) => {
    onEditResponse(responseId, newBody);
    setEditingResponseId(null);
  };

  return (
    <div className="border-l border-gray-700">
      {responses.map((response, index) => (
        <Collapsible key={`response-${index}`}>
          <CollapsibleTrigger asChild>
            <div 
              className="flex items-center justify-between p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700"
              onClick={() => handleToggleExpand(response.responseId)}
            >
              <div className="flex items-center space-x-2">
                {expandedResponseId === response.responseId ? 
                  <ChevronDown size={16} className="text-gray-300 hover:text-white transition-colors" /> : 
                  <ChevronRight size={16} className="text-gray-300 hover:text-white transition-colors" />
                }
                <span className={`px-2 py-0.5 rounded-full text-sm ${getMethodColor(method)}`}>
                  {method.toUpperCase()}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-sm ${
                  response.status.toString().startsWith('2') ? 'bg-green-500/20 text-green-400' :
                  response.status.toString().startsWith('4') ? 'bg-yellow-500/20 text-yellow-400' :
                  response.status.toString().startsWith('5') ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-300'
                }`}>
                  {response.status}
                </span>
                <span className="text-gray-400 text-sm">{response.headers['content-type']}</span>
                <span className="text-gray-400 text-sm">{response.headers['content-length']} bytes</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">
                  {new Date(response.headers['date']).toLocaleString('en-GB', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' })}
                </span>
                <LockButton
                  isLocked={response.isLocked ?? false}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLockResponse(response.responseId);
                  }}
                /> 
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-2 bg-gray-900 rounded">
              {response.isLocked ? (
                <>
                  {editingResponseId === response.responseId ? (
                    <div>
                      <CodeMirror
                        value={JSON.stringify(response.lockedBody ?? response.body, null, 2)}
                        height="auto"
                        extensions={[vim(), json(), basicSetup({
                          lineNumbers: false,
                          foldGutter: false,
                        })]}
                        theme="dark"
                        onChange={(value) => {
                          (document.querySelector('.cm-editor') as HTMLElement).setAttribute('data-value', value);
                        }}
                        className="rounded border border-gray-700"
                      />
                      <Button 
                        onClick={() => handleSaveEdit(
                          response.responseId, 
                          (document.querySelector('.cm-editor') as HTMLElement).getAttribute('data-value') || ''
                        )}
                        className="mt-2"
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <CodeMirror
                        value={JSON.stringify(response.lockedBody ?? response.body, null, 2)}
                        height="auto"
                        extensions={[json(), basicSetup({
                          lineNumbers: false,
                          foldGutter: false,
                        })]}
                        theme="dark"
                        className="rounded border border-gray-700"
                      />
                      <Button 
                        onClick={() => handleEditResponse(response.responseId)}
                        className="mt-2"
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <CodeMirror
                  value={JSON.stringify(response.body, null, 2)}
                  height="auto"
                  editable={false}
                  extensions={[json(), basicSetup({
                    lineNumbers: false,
                    foldGutter: false,
                  })]}
                  theme="dark"
                  className="rounded border border-gray-700"
                />
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

function getMethodColor(method: string): string {
  switch (method.toLowerCase()) {
    case "get":
      return "bg-emerald-500/20 text-emerald-400";
    case "delete":
      return "bg-red-500/20 text-red-400";
    case "post":
      return "bg-amber-500/20 text-amber-400";
    case "put":
      return "bg-orange-500/20 text-orange-400";
    case "patch":
      return "bg-yellow-500/20 text-yellow-400";
    case "options":
      return "bg-blue-500/20 text-blue-400";
    case "head":
      return "bg-blue-500/20 text-blue-400";
    default:
      return "bg-gray-500/20 text-gray-400";
  }
}

