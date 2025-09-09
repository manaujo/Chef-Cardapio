import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Download, Share2, Copy, ExternalLink, QrCode as QRIcon, Smartphone, Printer, Eye, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function QRGenerator() {
  const { restaurant } = useApp();
  const [copied, setCopied] = useState(false);
  const [qrSize, setQrSize] = useState(256);
  
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
      <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Carregando dados do restaurante...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <QRIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerador de QR Code</h1>
            <p className="text-gray-600">Compartilhe seu cardápio de forma prática e moderna</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Display */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <QRIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">QR Code do Cardápio</h2>
            </div>
            
            {/* QR Code Size Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tamanho do QR Code
              </label>
              <div className="flex items-center justify-center gap-2">
                {[200, 256, 300].map((size) => (
                  <button
                    key={size}
                    onClick={() => setQrSize(size)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      qrSize === size
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-inner border-2 border-gray-100 inline-block mb-6">
              <QRCode
                id="qr-code"
                size={qrSize}
                value={menuUrl}
                viewBox="0 0 256 256"
                style={{ height: "auto", maxWidth: "100%", width: `${qrSize}px` }}
                fgColor="#1f2937"
                bgColor="#ffffff"
              />
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
              <Smartphone className="w-4 h-4" />
              <span>Escaneie para acessar o cardápio</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={downloadQR}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Baixar QR Code
            </button>

            <button
              onClick={shareQR}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
            >
              <Share2 className="w-5 h-5" />
              Compartilhar
            </button>

            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
            >
              <Copy className="w-5 h-5" />
              {copied ? 'Link Copiado!' : 'Copiar Link'}
            </button>
          </div>
        </div>

        {/* Instructions and Info */}
        <div className="space-y-6">
          {/* URL Display */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-600" />
              Link do Cardápio
            </h3>
            <div className="bg-gray-50 p-4 rounded-xl border break-all text-sm font-mono">
              {menuUrl}
            </div>
            <button
              onClick={() => window.open(menuUrl, '_blank')}
              className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <Eye className="w-4 h-4" />
              Visualizar cardápio público
            </button>
          </div>

          {/* How to Use */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Como usar o QR Code
            </h3>
            <div className="space-y-4">
              {[
                { step: 1, text: 'Baixe ou imprima o QR Code', icon: Download },
                { step: 2, text: 'Cole nas mesas, balcão ou entrada do restaurante', icon: Printer },
                { step: 3, text: 'Clientes escaneiam e acessam o cardápio digital', icon: Smartphone },
                { step: 4, text: restaurant.whatsapp_orders_enabled 
                  ? 'Podem fazer pedidos direto pelo WhatsApp' 
                  : 'Visualizam o cardápio para fazer pedidos presenciais', icon: Eye }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-gray-900">Passo {item.step}</span>
                      </div>
                      <p className="text-gray-700 text-sm">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-2xl p-6 border border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              Vantagens do QR Code
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Acesso instantâneo sem apps',
                'Sempre atualizado automaticamente',
                'Reduz contato físico',
                'Facilita pedidos via WhatsApp',
                'Impressiona os clientes',
                'Economiza papel e impressão'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/60 backdrop-blur-sm p-3 rounded-lg">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                  <span className="text-gray-700 text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Dicas Importantes</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Imprima em alta qualidade para melhor leitura</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Coloque em locais bem iluminados e visíveis</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Teste regularmente se o QR Code está funcionando</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Adicione uma instrução simples: "Escaneie para ver o cardápio"</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}