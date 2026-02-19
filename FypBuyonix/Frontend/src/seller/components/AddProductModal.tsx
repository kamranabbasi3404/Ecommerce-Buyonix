import { useState } from "react";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: () => void; // Changed to just refresh
  sellerId: string;
}

const AddProductModal = ({ isOpen, onClose, onAddProduct, sellerId }: AddProductModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    category: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Color variants state
  const [showColorVariants, setShowColorVariants] = useState(false);
  const [colorVariants, setColorVariants] = useState<Array<{
    colorName: string;
    colorCode: string;
    image: string;
  }>>([]);

  const handleAddColorVariant = () => {
    setColorVariants([...colorVariants, { colorName: "", colorCode: "#000000", image: "" }]);
  };

  const handleRemoveColorVariant = (index: number) => {
    setColorVariants(colorVariants.filter((_, i) => i !== index));
  };

  const handleColorVariantChange = (index: number, field: string, value: string) => {
    const updated = [...colorVariants];
    updated[index] = { ...updated[index], [field]: value };
    setColorVariants(updated);
  };

  const handleColorImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleColorVariantChange(index, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch('http://localhost:5000/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sellerId,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : parseFloat(formData.price),
          stock: parseInt(formData.stock),
          images: imagePreview ? [imagePreview] : [],
          colorVariants: showColorVariants ? colorVariants.filter(v => v.colorName && v.colorCode && v.image) : []
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          originalPrice: "",
          stock: "",
          category: "",
        });
        setImagePreview("");
        setShowColorVariants(false);
        setColorVariants([]);
        onAddProduct(); // Refresh product list
        onClose();
      } else {
        setError(result.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price ($) <span className="text-gray-500 text-xs">(for discount calculation)</span>
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={isSubmitting}
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Sports">Sports</option>
                  <option value="Books">Books</option>
                  <option value="Toys">Toys</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Product Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Product Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-32 text-center">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setImagePreview("")}
                        className="text-sm text-red-600 hover:text-red-700"
                        disabled={isSubmitting}
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="space-y-2">
                        <div className="text-4xl text-gray-400">📷</div>
                        <div className="text-sm text-gray-600">
                          Click to upload image
                        </div>
                        <div className="text-xs text-gray-500">
                          PNG, JPG up to 5MB
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        required
                        disabled={isSubmitting}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Color Variants Section (Optional) */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Color Variants</label>
                <p className="text-xs text-gray-500">Add different color options for your product (optional)</p>
              </div>
              <button
                type="button"
                onClick={() => setShowColorVariants(!showColorVariants)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${showColorVariants
                    ? 'bg-teal-100 text-teal-700 border border-teal-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                  }`}
                disabled={isSubmitting}
              >
                {showColorVariants ? '✓ Enabled' : 'Add Colors'}
              </button>
            </div>

            {showColorVariants && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                {colorVariants.map((variant, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                    {/* Color Preview */}
                    <div
                      className="w-10 h-10 rounded-full border-2 border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: variant.colorCode }}
                    />

                    {/* Color Name */}
                    <input
                      type="text"
                      placeholder="Color Name (e.g. Amber Gold)"
                      value={variant.colorName}
                      onChange={(e) => handleColorVariantChange(index, 'colorName', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      disabled={isSubmitting}
                    />

                    {/* Color Picker */}
                    <input
                      type="color"
                      value={variant.colorCode}
                      onChange={(e) => handleColorVariantChange(index, 'colorCode', e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
                      disabled={isSubmitting}
                    />

                    {/* Image Upload */}
                    <label className="flex-shrink-0 cursor-pointer">
                      <div className={`w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center ${variant.image ? 'border-teal-400' : 'border-gray-300'
                        }`}>
                        {variant.image ? (
                          <img src={variant.image} alt="Color" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-gray-400 text-lg">📷</span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleColorImageChange(index, e)}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                    </label>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveColorVariant(index)}
                      className="text-red-500 hover:text-red-700 text-xl"
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddColorVariant}
                  className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-teal-400 hover:text-teal-600 transition-colors text-sm font-medium"
                  disabled={isSubmitting}
                >
                  + Add Color Variant
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
