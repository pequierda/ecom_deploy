import React from "react";

interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, ...props }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
      />
    </div>
  );
};

export default InputGroup;
