import { useRef, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ClientOnly } from 'remix-utils/client-only';
import { Button } from '../ui/button';

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

type HeadingSizes = {
  [key in 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6']: string;
};

export const FormattedPasteArea = ({ content, onChange }: FormattedPasteAreaProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Synchronize the editor content with incoming props
  useEffect(() => {
    if (editorRef.current && content && !isFocused) {
      editorRef.current.innerHTML = content;
    }
  }, [content, isFocused]);

  // Helper function to format plain text into HTML
  const formatPlainText = (text: string): string => {
    const lines = text.split('\n');
    return lines.map(line => {
      // Convert bullet points and dashes to list items
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return `<li>${line.trim().substring(1).trim()}</li>`;
      }
      // Convert numbered points to ordered list items
      if (/^\d+[\.\)]/.test(line.trim())) {
        return `<li>${line.trim().replace(/^\d+[\.\)]/, '').trim()}</li>`;
      }
      // Convert short lines without periods to headings
      if (line.trim().length > 0 && line.trim().length <= 50 && !line.includes('.')) {
        return `<h3>${line.trim()}</h3>`;
      }
      // Default to paragraphs
      return `<p>${line}</p>`;
    }).join('');
  };

  // Helper function to sanitize HTML content
  const sanitizeHTML = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Define allowed HTML elements and styles
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

    // Apply consistent formatting to lists
    const preserveListFormatting = (node: Element): void => {
      const htmlNode = node as HTMLElement;
      if (node.tagName.toLowerCase() === 'ul' || node.tagName.toLowerCase() === 'ol') {
        htmlNode.style.paddingLeft = '24px';
        htmlNode.style.listStyleType = node.tagName.toLowerCase() === 'ul' ? 'disc' : 'decimal';
      }
    };

    // Apply consistent heading styles
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

    // Clean and format HTML nodes
    const clean = (node: Element): Element => {
      if (node.nodeType === 1) {
        const tag = node.tagName.toLowerCase();
        
        // Convert unsupported tags to paragraphs
        if (!allowedTags.includes(tag)) {
          const p = document.createElement('p');
          p.innerHTML = node.innerHTML;
          return p;
        }
        
        // Apply formatting
        preserveListFormatting(node);
        preserveHeadingFormatting(node);
        
        // Clean styles
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
        
        // Remove unsupported attributes
        Array.from(node.attributes).forEach(attr => {
          if (!['style', 'data-list-type'].includes(attr.name)) {
            node.removeAttribute(attr.name);
          }
        });
      }
      return node;
    };
    
    // Process all nodes in the document
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

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData;
    let pastedData = '';
    
    // Process HTML content if available
    if (clipboardData.getData('text/html')) {
      pastedData = clipboardData.getData('text/html');
      pastedData = sanitizeHTML(pastedData);
      // Ensure proper list formatting
      pastedData = pastedData.replace(/<ul>/g, '<ul style="list-style-type: disc; padding-left: 24px;">');
      pastedData = pastedData.replace(/<ol>/g, '<ol style="list-style-type: decimal; padding-left: 24px;">');
    } else {
      // Process plain text content
      pastedData = clipboardData.getData('text/plain');
      pastedData = formatPlainText(pastedData);
      
      // Wrap lists in proper containers
      pastedData = pastedData.replace(/<li>(?:(?!<\/li>).)*<\/li>/g, match => {
        if (match.includes('•') || match.includes('-')) {
          return `<ul style="list-style-type: disc; padding-left: 24px;">${match}</ul>`;
        }
        return `<ol style="list-style-type: decimal; padding-left: 24px;">${match}</ol>`;
      });
    }
    
    // Insert content at cursor position
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    if (range) {
      range.deleteContents();
      const div = document.createElement('div');
      div.innerHTML = pastedData;
      
      const fragment = document.createDocumentFragment();
      while (div.firstChild) {
        fragment.appendChild(div.firstChild);
      }
      
      range.insertNode(fragment);
      range.collapse(false);
    }
    
    handleInput();
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      onPaste={handlePaste}
      onInput={handleInput}
      onFocus={() => setIsFocused(true)}
      onBlur={() => {
        setIsFocused(false);
        handleInput();
      }}
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

// export default FormattedPasteArea;

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