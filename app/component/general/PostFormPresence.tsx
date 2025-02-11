import React, { useState } from "react";

interface addFormProps {
  idClassroom: number;
  onSave: (date: string) => void;
}

const PostFormPresence: React.FC<addFormProps> = ({ onSave }) => {
  const [date, setDate] = useState("");

  const handleSave = () => {
    if (!date) {
      alert("Tanggal tidak boleh kosong!");
      return;
    }
    onSave(date); // Kirim tanggal ke handler di parent
  };

  return (
    <div>
      <div className="p-4 md:p-5 space-y-4">
        <div>
          <label
            htmlFor="Date"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Date
          </label>

          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          />
        </div>

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default PostFormPresence;
