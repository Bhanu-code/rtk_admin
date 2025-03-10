import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ClientOnly } from 'remix-utils/client-only';
import { Button } from '../ui/button';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Define our component props interface
interface FormattedPasteAreaProps {
  content: string;
  onChange: (content: string) => void;
}

interface WhoShouldWearProps {
  formData: {
    wearingGuidelines: {
      whoShouldWear: string;
    };
  };
  handleInputChange: (section: string, field: string, value: string) => void;
}

// type HeadingSizes = {
//   [key in 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6']: string;
// };

const FormattedPasteArea = ({ content, onChange }: FormattedPasteAreaProps) => {
  const quillRef = useRef(null);
  const [localContent, setLocalContent] = useState(content);
  const isInternalChange = useRef(false);
  const prevContentRef = useRef(content);

  // Update local content only when external content changes
  useEffect(() => {
    if (content !== prevContentRef.current && !isInternalChange.current) {
      setLocalContent(content);
      prevContentRef.current = content;
    }
    isInternalChange.current = false;
  }, [content]);

  // Debounced change handler to reduce re-renders
  const handleEditorChange = useCallback(
    (newContent:any) => {
      isInternalChange.current = true;
      setLocalContent(newContent);
      prevContentRef.current = newContent;
      
      if (typeof onChange === 'function') {
        onChange(newContent);
      }
    },
    [onChange]
  );

  // Memoize the modules configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    },
    keyboard: {
      bindings: {
        tab: {
          key: 9,
          handler: () => true
        }
      }
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'blockquote', 'code-block',
    'link'
  ];

  // Handle external content updates
  useEffect(() => {
    if (content !== prevContentRef.current && !isInternalChange.current) {
      setLocalContent(content);
      prevContentRef.current = content;
    }
    isInternalChange.current = false;
  }, [content]);

  // Improved change handler with debouncing
  // const handleEditorChange = useCallback((newContent) => {
  //   isInternalChange.current = true;
  //   setLocalContent(newContent);
  //   if (typeof onChange === 'function') {
  //     onChange(newContent);
  //   }
  // }, [onChange]);

  return (
    <div className="formatted-paste-area">
      <style>
        {`
          .formatted-paste-area .quill {
            border-radius: 0.375rem;
          }
          .formatted-paste-area .ql-editor {
            min-height: 200px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            background: white;
          }
          .formatted-paste-area .ql-toolbar {
            border-top-left-radius: 0.375rem;
            border-top-right-radius: 0.375rem;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .formatted-paste-area .ql-container {
            border: 1px solid #e5e7eb;
            border-top: none;
            border-bottom-left-radius: 0.375rem;
            border-bottom-right-radius: 0.375rem;
            font-size: 16px;
            height: auto;
            min-height: 200px;
          }
          .formatted-paste-area .ql-snow .ql-tooltip {
            background-color: #fff;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            border-radius: 0.375rem;
          }
          .formatted-paste-area .ql-snow .ql-picker {
            color: #374151;
          }
          .formatted-paste-area .ql-snow .ql-stroke {
            stroke: #374151;
          }
          .formatted-paste-area .ql-snow .ql-fill {
            fill: #374151;
          }
          .formatted-paste-area .ql-snow.ql-toolbar button:hover,
          .formatted-paste-area .ql-snow .ql-toolbar button:hover {
            color: #2563eb;
          }
          .formatted-paste-area .ql-snow.ql-toolbar button:hover .ql-stroke,
          .formatted-paste-area .ql-snow .ql-toolbar button:hover .ql-stroke {
            stroke: #2563eb;
          }
          .formatted-paste-area .ql-snow.ql-toolbar button:hover .ql-fill,
          .formatted-paste-area .ql-snow .ql-toolbar button:hover .ql-fill {
            fill: #2563eb;
          }
        `}
      </style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={localContent}
        onChange={handleEditorChange}
        modules={modules}
        formats={formats}
        preserveWhitespace
      />
    </div>
  );
};

export default FormattedPasteArea;
// export FormattedPasteArea;

const WhoShouldWear = ({ formData, handleInputChange }: WhoShouldWearProps) => {

  const saveToJson = () => {
    try {
      const jsonData = JSON.stringify({
        wearingGuidelines: {
          whoShouldWear: formData.wearingGuidelines.whoShouldWear
        }
      }, null, 2);
      
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'wearing-guidelines.json';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving JSON:', error);
    }
  };

  const handleFileUpload = (event:any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = JSON.parse(e.target?.result as string);
        handleInputChange(
          'wearingGuidelines',
          'whoShouldWear',
          jsonContent.wearingGuidelines.whoShouldWear
        );
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-base font-medium">
          Who Should Wear This Gemstone
        </Label>
        <Card>
          <CardContent className="pt-4">
            <ClientOnly fallback={
              <div className="h-[200px] flex items-center justify-center bg-gray-50">
                Loading editor...
              </div>
            }>
              {() => (
                <FormattedPasteArea
                  content={formData.wearingGuidelines.whoShouldWear}
                  onChange={(content) => handleInputChange('wearingGuidelines', 'whoShouldWear', content)}
                />
              )}
            </ClientOnly>
          </CardContent>
        </Card>
      </div>

      {/* Add JSON import/export buttons */}
      <div className="flex gap-4">
        <Button onClick={saveToJson}>
          Save to JSON
        </Button>
        <div>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="jsonFileInput"
          />
          <Button 
            onClick={() => document.getElementById('jsonFileInput')?.click()}
          >
            Load from JSON
          </Button>
        </div>
      </div>
    </div>
  );
};

export  {WhoShouldWear ,FormattedPasteArea} ;