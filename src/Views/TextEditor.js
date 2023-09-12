import React, { useState, useEffect } from "react";

const TextEditor = (props) => {
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [downloadVisible, setDownloadVisible] = useState(false);
  const [content, setContent] = useState("");
  const [lineNumbers, setLineNumbers] = useState([]);

  const calcNumbers = () => {
    const contentArray = content.split("\n");
    const newLineNumbers = [];

    if (contentArray.length < 10) {
      contentArray.length = 10;
    }

    for (let i = 0; i < contentArray.length; i++) {
      newLineNumbers.push(<p key={i}>{i + 1}</p>);
    }

    setLineNumbers(newLineNumbers);
  };

  useEffect(() => {
    calcNumbers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setContent(value);
  };

  // TRANSLATOR =====================================================
  /* const handleConfigFileChange = (e) => {
    const fileName = e.target.value.split("\\").pop();
    e.target.nextElementSibling.innerHTML = fileName;
  }; */

  const handleDownloadFile = () => {
    const blob = new Blob([translatedText], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "translated_config.yml";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const handleTranslateClick = () => {
    const configText = document.getElementById("configInput").value;
    const fileInput = document.getElementById("configFile");
    //const file = fileInput.files[0];

    if (configText) {
      setLoadingVisible(true);

      setTimeout(() => {
        setLoadingVisible(false);
        translate(configText || fileInput.value)
          .then((translatedText) => {
            setTranslatedText(translatedText);
            setDownloadVisible(true);
          })
          .catch((error) => {
            console.error("Translation error:", error);
          });
      }, 500);
    }
  };

  const translate = async (sourceText) => {
    var sourceLang = "en";
    var targetLang = "vi";
    var matches = sourceText.match(/.*: (.*)/g);
    if (!matches) return;
    var translatedText = sourceText;

    const translationPromises = matches.map(async (match) => {
      var textToTranslate = match.match(/: (.*)/)[1];
      if (
        textToTranslate.trim() === "true" ||
        textToTranslate.trim() === "false" ||
        textToTranslate.trim() === "disabled" ||
        textToTranslate.trim() === "enabled"
      ) {
        return textToTranslate;
      }

      // Kiểm tra nếu từ đằng sau dấu & là số
      if (
        textToTranslate.startsWith("&") &&
        /^\d+$/.test(textToTranslate.substr(1))
      ) {
        return textToTranslate;
      }

      // Kiểm tra nếu cấu trúc chứa dấu <pos>
      if (textToTranslate.includes("<pos>")) {
        return textToTranslate;
      }

      // Kiểm tra nếu từ có chữ hoa ở đầu
      if (/^[A-Z]/.test(textToTranslate)) {
        return textToTranslate;
      }

      // Thay thế dấu < và > bằng [ và ]
      textToTranslate = textToTranslate.replace(/<pos>/g, "[pos]");
      textToTranslate = textToTranslate.replace(/{(\d)}/g, "[$1]");

      // Tách phần dịch bên trong dấu && và phần còn lại
      var innerTranslation = "";
      var outerText = textToTranslate.replace("/(&&.*?&&)/g", function (match) {
        innerTranslation = match;
        return "";
      });

      // Split the string into parts based on special characters
      var parts = outerText.split(/(&\w)/);

      const translationRequests = parts.map(async (part, index) => {
        // Only translate parts that do not start with a special character
        if (!part.startsWith("&") && part !== "%%" && !/prefix/i.test(part)) {
          var url =
            "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" +
            sourceLang +
            "&tl=" +
            targetLang +
            "&dt=t&q=" +
            encodeURI(part);

          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error("Translation request failed");
            }
            const data = await response.json();
            var translatedValue = data[0][0][0];
            // Replace the original part with the translated part
            parts[index] = translatedValue;
          } catch (error) {
            console.error("Translation error:", error);
          }
        }
      });

      await Promise.all(translationRequests);

      // Join the translated parts back together
      var fullTranslatedValue = parts.join("");

      // Thay thế lại dấu [ và ] thành < và >
      fullTranslatedValue = fullTranslatedValue.replace(/\[pos\]/g, "<pos>");
      fullTranslatedValue = fullTranslatedValue.replace(/\[(\d)\]/g, "{$1}");

      // Nếu có phần dịch bên trong dấu &&
      if (innerTranslation) {
        // Thay thế phần dịch bên trong bằng chính nó
        fullTranslatedValue += " " + innerTranslation;
      }

      translatedText = translatedText.replace(
        textToTranslate,
        fullTranslatedValue
      );
    });

    await Promise.all(translationPromises);
    return translatedText;
  };
  return (
    <>
      {/* INPUT FORM */}
      <div
        className={`flex-1 bg-gray-800 p-3 ${props.className}`}
        style={{ maxHeight: "350px", overflowY: "auto" }}
      >
        <div id={`${props.editorId}_display`} className="flex-1"></div>
        <div
          id={`${props.editorId}_wrapper`}
          className="flex-1 relative flex bg-green-600 text-sm border border-gray-700 shadow leading-loose text-white"
        >
          <div
            id={`${props.editorId}_numbers`}
            className="p-2 text-center bg-gray-700 border-r border-gray-800"
          >
            {lineNumbers}
          </div>
          <textarea
            htmlFor="configInput"
            id="configInput"
            className="flex-1 p-2 outline-none text-white"
            value={content}
            onChange={handleInputChange}
          ></textarea>
        </div>
      </div>
      {/* RESULT FORM */}
      {translatedText && (
        <>
          <div
            className={`flex-1 bg-gray-800 p-3`}
            style={{ maxHeight: "350px", overflowY: "auto" }}
          >
            <div id={`result_display`} className="flex-1"></div>
            <div
              id={`result_wrapper`}
              className="flex-1 relative flex bg-green-600 text-sm border border-gray-700 shadow leading-loose text-white"
            >
              <div
                id={`result_numbers`}
                className="p-2 text-center bg-gray-700 border-r border-gray-800"
              >
                {lineNumbers}
              </div>
              <textarea
                id="resultText"
                className="flex-1 p-2 outline-none text-white"
                value={translatedText}
              ></textarea>
            </div>
          </div>
        </>
      )}

      {loadingVisible && (
        <div
          className="loading-popup bg-gray-800 pt-12 pb-6 flex-1"
          id="loadingPopup"
        >
          <div className="content">
            <div className="loading-message">Đang dịch...</div>
            <div className="loading-message">
              Nếu dịch quá lâu thì là do file của bạn khá nặng
            </div>
          </div>
        </div>
      )}
      {/* BTN */}
      <div className="flex bg-gray-800 justify-center">
        <button
          id="button"
          className="border border-gray-400 mr-4 rounded p-2 h-12 inline-flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white flex-shrink-0"
          onClick={handleTranslateClick}
        >
          Việt hóa
        </button>
        {downloadVisible && (
          <div className="flex bg-gray-800">
            <a
              href="#!"
              className="border border-gray-400 mr-2 rounded p-2 h-12 inline-flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white flex-shrink-0"
              id="downloadButton"
              onClick={handleDownloadFile}
            >
              Tải File Dịch
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default TextEditor;
