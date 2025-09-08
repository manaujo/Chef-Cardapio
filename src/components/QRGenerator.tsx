import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Download, Share2, Copy, ExternalLink, QrCode as QRIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function QRGenerator() {
  const { restaurant } = useApp();
  const [copied, setCopied] = useState(false);
  
  const menuUrl = `${window.location.origin}/menu/${restaurant?.id || 'preview'}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.download = `qr-code-${restaurant?.name.toLowerCase().replace(/\s+/g, '-') || 'cardapio'}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
        }
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Cardápio - ${restaurant?.name || 'Restaurante'}`,
          text: `Confira o cardápio do ${restaurant?.name || 'Restaurante'}`,
          url: menuUrl,
        });
      } catch (err) {
        console.error('Error sharing: ', err);
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard();
    }
  };

  if (!restaurant) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-gray-600">Carregando dados do restaurante...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerador de QR Code</h1>
        <p className="text-gray-600">Compartilhe seu cardápio de forma prática e moderna</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <QRIcon className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">QR Code do Cardápio</h2>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-inner border-2 border-gray-100 inline-block">
              <QRCode
                id="qr-code"
                size={200}
                value={menuUrl}
                viewBox="0 0 256 256"
                style={{ height: "auto", maxWidth: "100%", width: "200px" }}
              />
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              Escaneie para acessar o cardápio
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={downloadQR}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Baixar QR Code
            </button>

            <button
              onClick={shareQR}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              <Share2 className="w-5 h-5" />
              Compartilhar
            </button>

            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <Copy className="w-5 h-5" />
              {copied ? 'Link Copiado!' : 'Copiar Link'}
            </button>
          </div>
        </div>

        {/* Instructions and Info */}
        <div className="space-y-6">
          {/* URL Display */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-600" />
              Link do Cardápio
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg border break-all text-sm">
              {menuUrl}
            </div>
          </div>

          {/* How to Use */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Como usar o QR Code</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <p>Baixe ou imprima o QR Code</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <p>Cole nas mesas, balcão ou entrada do restaurante</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <p>Clientes escaneiam e acessam o cardápio digital</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <p>
                  {restaurant.whatsapp_orders_enabled 
                    ? 'Podem fazer pedidos direto pelo WhatsApp' 
                    : 'Visualizam o cardápio para fazer pedidos presenciais'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vantagens do QR Code</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Acesso instantâneo sem apps</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Sempre atualizado automaticamente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Reduz contato físico</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Facilita pedidos via WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}