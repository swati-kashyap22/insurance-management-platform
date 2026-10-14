import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import Sidebar from "./Sidebar";

const API_BASE_URL = "http://localhost:5000/api";

function Documents() {
  const [documents, setDocuments] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [claimId, setClaimId] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // LOAD DOCUMENTS
  const loadDocuments = async () => {
    if (!customerId) {
      setDocuments([]);
      return;
    }

    try {
      setLoadingDocuments(true);
      setError("");

      const data = await apiRequest(
        `/documents/customer/${customerId}`
      );

      setDocuments(data.documents || []);
    } catch (error) {
      setError(error.message);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // LOAD DOCUMENTS WHEN CUSTOMER ID CHANGES
  useEffect(() => {
    if (customerId) {
      loadDocuments();
    } else {
      setDocuments([]);
    }
  }, [customerId]);

  // UPLOAD DOCUMENT
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select a document to upload.");
      return;
    }

    if (!customerId) {
      setError("Please enter a customer ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("document", selectedFile);
      formData.append("customerId", customerId);

      if (claimId) {
        formData.append("claimId", claimId);
      }

      const data = await apiRequest("/documents/upload", {
        method: "POST",
        body: formData,
      });

      setSuccess(data.message);

      setSelectedFile(null);
      setClaimId("");

      document.getElementById("document-file").value = "";

      await loadDocuments();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // DOWNLOAD DOCUMENT
  const handleDownload = async (documentId, fileName) => {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/documents/${documentId}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.message || "Failed to download document"
        );
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      <Sidebar />

      <div className="flex-1">

        {/* HEADER */}
        <header className="bg-white shadow-sm">

          <div className="px-8 py-5">

            <h1 className="text-2xl font-bold text-gray-800">
              Documents
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Upload, view and download insurance documents
            </p>

          </div>

        </header>

        <main className="p-8">

          {/* SUCCESS */}
          {success && (
            <div className="bg-green-100 text-green-700 rounded-lg px-4 py-3 mb-6">
              {success}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* UPLOAD */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Upload Document
            </h2>

            <form
              onSubmit={handleUpload}
              className="space-y-5"
            >

              {/* CUSTOMER ID */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer ID
                </label>

                <input
                  type="number"
                  min="1"
                  value={customerId}
                  onChange={(e) =>
                    setCustomerId(e.target.value)
                  }
                  placeholder="Enter customer ID"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Example: Customer ID 1
                </p>

              </div>

              {/* CLAIM ID */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Claim ID
                </label>

                <input
                  type="number"
                  min="1"
                  value={claimId}
                  onChange={(e) =>
                    setClaimId(e.target.value)
                  }
                  placeholder="Optional — attach to a claim"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if this is a general customer document.
                </p>

              </div>

              {/* FILE */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Document
                </label>

                <input
                  id="document-file"
                  type="file"
                  onChange={(e) =>
                    setSelectedFile(e.target.files[0])
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size: 5 MB
                </p>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50"
              >
                {loading
                  ? "Uploading..."
                  : "Upload Document"}
              </button>

            </form>

          </div>

          {/* CUSTOMER DOCUMENT SEARCH */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

            <h2 className="text-xl font-bold text-gray-800 mb-5">
              View Customer Documents
            </h2>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer ID
            </label>

            <input
              type="number"
              min="1"
              value={customerId}
              onChange={(e) =>
                setCustomerId(e.target.value)
              }
              placeholder="Enter customer ID"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* DOCUMENT LIST */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">

            <div className="px-6 py-5 border-b">

              <h2 className="text-lg font-bold text-gray-800">
                Uploaded Documents
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {customerId
                  ? `${documents.length} document(s) found`
                  : "Enter a customer ID to view documents"}
              </p>

            </div>

            {!customerId ? (

              <div className="p-8 text-center text-gray-500">
                Enter a customer ID above.
              </div>

            ) : loadingDocuments ? (

              <div className="p-8 text-center text-gray-500">
                Loading documents...
              </div>

            ) : documents.length === 0 ? (

              <div className="p-8 text-center text-gray-500">
                No documents found for this customer.
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        ID
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        File Name
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        File Type
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Uploaded
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Claim
                      </th>

                      <th className="text-left px-5 py-4 text-sm font-semibold text-gray-600">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y">

                    {documents.map((document) => (

                      <tr
                        key={document.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-5 py-4 font-semibold">
                          {document.id}
                        </td>

                        <td className="px-5 py-4 text-gray-800">
                          {document.fileName}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {document.fileType}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {new Date(
                            document.createdAt
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {document.claimId || "-"}
                        </td>

                        <td className="px-5 py-4">

                          <button
                            onClick={() =>
                              handleDownload(
                                document.id,
                                document.fileName
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                          >
                            Download
                          </button>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}

export default Documents;