import React, { useState, useEffect } from "react";
import yaml from "js-yaml";

const YamlChecker = () => {
  const [yamlText, setYamlText] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState("");
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

    const newText = e.target.value;
    setYamlText(newText);

    try {
      yaml.load(newText);
      setIsValid(true);
      setError("");
    } catch (e) {
      setIsValid(false);
      setError(e.message.replace(/\n/g, "<br />"));
    }
  };

  return (
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
            value={yamlText}
            onChange={handleInputChange}
          ></textarea>
        </div>
      </div>
      <div className="bg-gray-700">
        {!isValid && (
          <div class="w-1/2 mx-auto my-4 p-6 shadow-lg rounded-lg bg-gray-800">
            <h2 class="mb-2" dangerouslySetInnerHTML={{ __html: error }} />
            <p class="uppercase font-bold ">YAML is not valid</p>
          </div>
        )}
      </div>
    </>
  );
};

export default YamlChecker;
