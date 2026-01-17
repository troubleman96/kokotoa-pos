import { useRef } from 'react';
import { X, Printer, Download, Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    receiptText: string;
    receiptNumber: string;
}

const ReceiptModal = ({ isOpen, onClose, receiptText, receiptNumber }: ReceiptModalProps) => {
    const { language } = useLanguage();
    const printRef = useRef<HTMLPreElement>(null);

    const handlePrint = () => {
        const printContent = printRef.current?.innerText;
        if (!printContent) return;

        // Create a hidden iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) return;

        doc.open();
        doc.write(`
            <html>
                <head>
                    <title>Receipt ${receiptNumber}</title>
                    <style>
                        @page { size: auto; margin: 0; }
                        body { 
                            font-family: 'Courier New', Courier, monospace; 
                            font-size: 12px; 
                            line-height: 1.2; 
                            padding: 20px;
                            width: 300px;
                            margin: 0 auto;
                        }
                        pre { white-space: pre-wrap; word-wrap: break-word; }
                    </style>
                </head>
                <body>
                    <pre>${printContent}</pre>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() {
                                window.frameElement.remove();
                            }, 100);
                        };
                    </script>
                </body>
            </html>
        `);
        doc.close();
    };

    const handleDownload = () => {
        const element = document.createElement('a');
        const file = new Blob([receiptText], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `Receipt_${receiptNumber}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-card border-border overflow-hidden flex flex-col max-h-[90vh]">
                <DialogHeader className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="font-display flex items-center gap-2">
                            <Printer className="w-5 h-5 text-primary" />
                            {language === 'sw' ? 'Risiti ya Malipo' : 'Payment Receipt'}
                        </DialogTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
                    <div className="bg-white dark:bg-zinc-900 border border-border shadow-sm mx-auto w-full max-w-[300px] p-4 text-zinc-900 dark:text-zinc-100">
                        <pre
                            ref={printRef}
                            className="font-mono text-xs leading-relaxed whitespace-pre-wrap break-words"
                            style={{ fontFamily: "'Courier New', Courier, monospace" }}
                        >
                            {receiptText}
                        </pre>
                    </div>
                </div>

                <div className="p-4 border-t border-border bg-card flex gap-2">
                    <Button
                        onClick={handlePrint}
                        className="flex-1 btn-kokotoa shadow-lg"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        {language === 'sw' ? 'Chapisha' : 'Print'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDownload}
                        className="flex-1 border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {language === 'sw' ? 'Pakua' : 'Download'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReceiptModal;
