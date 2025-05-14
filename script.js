document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file && file.type === "application/pdf") {
    extractTextFromPDF(file);
  } else {
    alert("PDF 파일만 업로드 가능합니다.");
  }
});

function extractTextFromPDF(file) {
  const reader = new FileReader();

  reader.onload = function(e) {
    const pdfData = new Uint8Array(e.target.result);
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });

    loadingTask.promise.then(function(pdf) {
      const numPages = pdf.numPages;
      const pagePromises = [];

      for (let i = 1; i <= numPages; i++) {
        pagePromises.push(
          pdf.getPage(i).then(page => {
            return page.getTextContent().then(textContent => {
              return textContent.items.map(item => item.str).join(' ');
            });
          })
        );
      }

      Promise.all(pagePromises).then(pagesText => {
        const fullText = pagesText.join('\n\n');
        document.getElementById('pdfText').textContent = fullText;
        speakText(fullText);
      });
    }).catch(function(error) {
      alert("PDF를 처리하는 중 오류 발생: " + error.message);
    });
  };

  reader.readAsArrayBuffer(file);
}

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';  // 한국어로 설정
  const voices = speechSynthesis.getVoices();
  const koreanVoice = voices.find(voice => voice.lang === 'ko-KR');
  if (koreanVoice) utterance.voice = koreanVoice;
  speechSynthesis.speak(utterance);
}
