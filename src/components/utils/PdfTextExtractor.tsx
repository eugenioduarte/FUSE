import React, { useMemo } from 'react'
import { View } from 'react-native'
import { WebView, WebViewMessageEvent } from 'react-native-webview'

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <div id="app"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    window.extractPdfText = function(base64) {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const raw = atob(base64);
        const len = raw.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = raw.charCodeAt(i);
        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        loadingTask.promise.then(async function (pdf) {
          let out = '';
          for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(i => i.str).join(' ');
            out += pageText + '\n';
          }
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ok', text: out }));
        }).catch(function (e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'err', error: String(e) }));
        });
      } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'err', error: String(e) }));
      }
    }
  </script>
</body>
</html>`

export default function PdfTextExtractor({
  base64,
  onDone,
}: Readonly<{
  base64: string
  onDone: (
    result: { ok: true; text: string } | { ok: false; error: string },
  ) => void
}>) {
  const injected = useMemo(
    () => `(${String(() => {})})(); extractPdfText(${JSON.stringify(base64)});`,
    [base64],
  )

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data)
      if (data?.type === 'ok')
        onDone({ ok: true, text: String(data.text || '') })
      else onDone({ ok: false, error: String(data?.error || 'unknown') })
    } catch (err: any) {
      onDone({ ok: false, error: String(err?.message || err) })
    }
  }

  return (
    <View style={{ width: 1, height: 1, opacity: 0 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        onMessage={onMessage}
        injectedJavaScript={injected}
      />
    </View>
  )
}
