import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ProxyResponse } from '@/types/proxy';
import { LockButton } from './ui/lock-button';

interface ResponseListProps {
  responses: ProxyResponse[];
  onLockResponse: (responseId: string) => void;
  onEditResponse: (responseId: string, newBody: string) => void;
}

export const ResponseList: React.FC<ResponseListProps> = ({ responses, onLockResponse, onEditResponse }) => {
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
    <div className="pl-4 border-l border-gray-700">
      {responses.map((response, index) => (
        <Collapsible key={`response-${index}`} className="mb-2">
          <CollapsibleTrigger asChild>
            <div 
              className="flex items-center justify-between p-2 bg-gray-800 rounded cursor-pointer hover:bg-gray-700"
              onClick={() => handleToggleExpand(response.id)}
            >
              <div className="flex items-center space-x-2">
                {expandedResponseId === response.id ? 
                  <ChevronDown size={16} className="text-gray-300 hover:text-white transition-colors" /> : 
                  <ChevronRight size={16} className="text-gray-300 hover:text-white transition-colors" />
                }
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
                    onLockResponse(response.id);
                  }}
                />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-2 bg-gray-900 rounded mt-1">
              {response.isLocked ? (
                <>
                  {editingResponseId === response.id ? (
                    <div>
                      <textarea
                        className="w-full h-40 p-2 bg-gray-800 text-gray-300 rounded"
                        defaultValue={response.body}
                      />
                      <Button 
                        onClick={() => handleSaveEdit(response.id, (document.querySelector('textarea') as HTMLTextAreaElement).value)}
                        className="mt-2"
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <pre className="text-gray-300 whitespace-pre-wrap">{response.body}</pre>
                      <Button 
                        onClick={() => handleEditResponse(response.id)}
                        className="mt-2"
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <pre className="text-gray-300 whitespace-pre-wrap">{JSON.stringify(response.body, null, 2)}</pre>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

