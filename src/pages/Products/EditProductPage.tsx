import { useState } from "react";
import { useFormik } from "formik";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";
import ClipLoader from "react-spinners/ClipLoader";
import { userRequest } from "@/utils/requestMethods";
import { useParams } from "react-router-dom";

const EditProductForm = () => {
  const [filePreviews, setFilePreviews] = useState({});
  const { id } = useParams();

  const formik = useFormik({
    initialValues: {
      category: "",
      name: "",
      description: "",
      actual_price: 0,
      sale_price: 0,
      physical_properties: "",
      base_img_url: null,
      sec_img1_url: null,
      sec_img2_url: null,
      sec_img3_url: null,
    },
    validate: (values) => {
      const errors = {
        category: "",
        name: "",
        actual_price: "",
        sale_price: "",
      };
      if (!values.category) errors.category = "Category is required";
      if (!values.name) errors.name = "Product name is required";
      if (!values.actual_price || values.actual_price < 0) {
        errors.actual_price = "Actual price must be a positive number";
      }
      if (values.sale_price < 0) {
        errors.sale_price = "Offer price cannot be negative";
      }
      return errors;
    },
    onSubmit: async (values:any) => {
      const formData:any = new FormData();
      for (const key in values) {
        if (values[key] instanceof File) {
          formData.append(key, values[key]);
        } else {
          formData.append(key, values[key]);
        }
      }
      updateProductMutation.mutate(formData);
    },
  });

  const getProductById = () => {
    return userRequest({
      url: `/product/get-product/${id}`,
      method: "get",
    });
  };

  const updateProduct = () => {
    return userRequest({
      url: `/product/update-product/${id}`,
      method: "put",
      data: formik.values
    });
  };

  const { isLoading: loadingProduct, data } = useQuery(
    "get-product-by-id",
    getProductById,
    {
      onSuccess: () => {
        formik.setValues({
          category: data.data.product.category,
          name: data.data.product.name,
          description: data.data.product.description,
          actual_price: data.data.product.actual_price,
          offer_price: data.data.product.offer_price,
          physical_properties: data.data.product.physical_properties,
          base_img_url: null,
          sec_img1_url: null,
          sec_img2_url: null,
          sec_img3_url: null,
        });
        setFilePreviews({
          base_img_url: data.data.product.base_img_url,
          sec_img1_url: data.data.product.sec_img1_url,
          sec_img2_url: data.data.product.sec_img2_url,
          sec_img3_url: data.data.product.sec_img3_url,
        });
      },
    }
  );

  const updateProductMutation = useMutation("update-product", updateProduct, {
    onSuccess: () => {
      toast.success("Product updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update product. Please try again.");
    },
  });

  const handleFileChange = (event:any, field:any) => {
    const file = event.target.files[0];
    if (file) {
      formik.setFieldValue(field, file);
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreviews((prev) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loadingProduct)
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="blue" size={50} />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h1 className="text-xl font-semibold mb-4">Edit Product</h1>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {[
          { label: "Category", name: "category", type: "text" },
          { label: "Name", name: "name", type: "text" },
          { label: "Description", name: "description", type: "textarea" },
          { label: "Actual Price", name: "actual_price", type: "number" },
          { label: "Offer Price", name: "offer_price", type: "number" },
          {
            label: "Physical Properties",
            name: "physical_properties",
            type: "text",
          },
        ].map((field) => (
          <div key={field.name} className="space-y-1">
            <label className="block font-medium">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                name={field.name}
                value={formik.values[field.name]}
                onChange={formik.handleChange}
                className="w-full px-4 py-2 border rounded-md"
              ></textarea>
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formik.values[field.name]}
                onChange={formik.handleChange}
                className="w-full px-4 py-2 border rounded-md"
              />
            )}
            {formik.errors[field.name] && (
              <div className="text-sm text-red-500">
                {formik.errors[field.name]}
              </div>
            )}
          </div>
        ))}

        {[
          { label: "Base Image", name: "base_img_url" },
          { label: "Secondary Image 1", name: "sec_img1_url" },
          { label: "Secondary Image 2", name: "sec_img2_url" },
          { label: "Secondary Image 3", name: "sec_img3_url" },
        ].map((field) => (
          <div key={field.name} className="grid grid-cols-3space-y-1">
            <label className="block font-medium">{field.label}</label>
            <input
              type="file"
              name={field.name}
              onChange={(e) => handleFileChange(e, field.name)}
              className="w-full"
            />
            {filePreviews[field.name] && (
              <img
                src={filePreviews[field.name]}
                alt={field.label}
                className="w-20 h-20 object-cover mt-2 rounded-md"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={updateProductMutation.isLoading}
          className={`w-full px-4 py-2 text-white rounded-md ${
            updateProductMutation.isLoading ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          {updateProductMutation.isLoading ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProductForm;
