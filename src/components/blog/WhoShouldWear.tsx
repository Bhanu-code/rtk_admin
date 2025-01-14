import { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ClientOnly } from 'remix-utils/client-only';
import { Button } from '../ui/button';

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

type HeadingSizes = {
  [key in 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6']: string;
};

export const FormattedPasteArea = ({ content, onChange }: { 
  content: string; 
  onChange: (content: string) => void; 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Update editor content when prop changes
  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);



  const sanitizeHTML = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const allowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'span',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'i', 'div'
    ];
    
    const allowedStyles = [
      'font-weight',
      'font-style',
      'text-decoration',
      'color',
      'background-color',
      'text-align',
      'margin-left',
      'padding-left',
      'list-style-type'
    ];

    // We now cast the Element to HTMLElement to access style properties
    const preserveListFormatting = (node: Element): void => {
      const htmlNode = node as HTMLElement;
      if (node.tagName.toLowerCase() === 'ul' || node.tagName.toLowerCase() === 'ol') {
        htmlNode.style.paddingLeft = '24px';
        if (node.tagName.toLowerCase() === 'ul') {
          htmlNode.style.listStyleType = 'disc';
        } else {
          htmlNode.style.listStyleType = 'decimal';
        }
      }
    };

    const preserveHeadingFormatting = (node: Element): void => {
      const htmlNode = node as HTMLElement;
      const tag = node.tagName.toLowerCase();
      if (tag.match(/^h[1-6]$/)) {
        const sizes: HeadingSizes = {
          h1: '2rem',
          h2: '1.75rem',
          h3: '1.5rem',
          h4: '1.25rem',
          h5: '1.1rem',
          h6: '1rem'
        };
        htmlNode.style.fontSize = sizes[tag as keyof HeadingSizes];
        htmlNode.style.fontWeight = 'bold';
        htmlNode.style.margin = '1em 0 0.5em 0';
      }
    };
    
    const clean = (node: Element): Element => {
      if (node.nodeType === 1) {
        const tag = node.tagName.toLowerCase();
        
        if (!allowedTags.includes(tag)) {
          const p = document.createElement('p');
          p.innerHTML = node.innerHTML;
          return p;
        }
        
        preserveListFormatting(node);
        preserveHeadingFormatting(node);
        
        if (node.hasAttribute('style')) {
          const styles = node.getAttribute('style')?.split(';')
            .filter(style => {
              const prop = style.split(':')[0]?.trim();
              return prop ? allowedStyles.includes(prop) : false;
            })
            .join(';');
          if (styles) {
            node.setAttribute('style', styles);
          } else {
            node.removeAttribute('style');
          }
        }
        
        Array.from(node.attributes).forEach((attr: Attr) => {
          if (!['style', 'data-list-type'].includes(attr.name)) {
            node.removeAttribute(attr.name);
          }
        });
      }
      return node;
    };
    
    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      null
    );
    
    let node: Node | null;
    while (node = walker.nextNode()) {
      if (node instanceof Element) {
        const cleanNode = clean(node);
        node.parentNode?.replaceChild(cleanNode, node);
      }
    }
    
    return tempDiv.innerHTML;
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    let pastedData = '';
    
    if (clipboardData.getData('text/html')) {
      pastedData = clipboardData.getData('text/html');
      pastedData = sanitizeHTML(pastedData);
      pastedData = pastedData.replace(/<ul>/g, '<ul style="list-style-type: disc; padding-left: 24px;">');
      pastedData = pastedData.replace(/<ol>/g, '<ol style="list-style-type: decimal; padding-left: 24px;">');
    } else {
      pastedData = clipboardData.getData('text/plain');
      const lines = pastedData.split('\n');
      pastedData = lines.map(line => {
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return `<li>${line.trim().substring(1).trim()}</li>`;
        }
        if (/^\d+[\.\)]/.test(line.trim())) {
          return `<li>${line.trim().replace(/^\d+[\.\)]/, '').trim()}</li>`;
        }
        if (line.trim().length > 0 && line.trim().length <= 50 && !line.includes('.')) {
          return `<h3>${line.trim()}</h3>`;
        }
        return `<p>${line}</p>`;
      }).join('');
      
      pastedData = pastedData.replace(/<li>(?:(?!<\/li>).)*<\/li>/g, match => {
        if (match.includes('•') || match.includes('-')) {
          return `<ul style="list-style-type: disc; padding-left: 24px;">${match}</ul>`;
        }
        return `<ol style="list-style-type: decimal; padding-left: 24px;">${match}</ol>`;
      });
    }
    
    document.execCommand('insertHTML', false, pastedData);
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      onPaste={handlePaste}
      onInput={handleInput}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={`min-h-[200px] p-4 border rounded-lg overflow-auto ${
        isFocused ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'
      }`}
      style={{
        outline: 'none',
        lineHeight: '1.5',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    />
  );
};

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

export default WhoShouldWear;