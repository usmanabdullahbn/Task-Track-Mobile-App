// const API_BASE_URL = "http://10.0.0.90:4000/api";
const API_BASE_URL = "http://172.23.160.1:4000/api";
// const API_BASE_URL = "http://127.0.0.1:4000/api";
// const API_BASE_URL = "http://192.168.10.10:4000/api"; // Qatar IP
// const API_BASE_URL = "http://localhost:4000/api";
// const API_BASE_URL = "https://backend-task-track.onrender.com/api";

export const TASK_STATUS = ["Todo", "In Progress", "Completed", "On Hold"];

export const apiClient = {
  // ============================
  //         DASHBOARD
  // ============================

  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) throw new Error("Failed to fetch dashboard stats");
    return response.json();
  },

  async getDashboardActivities() {
    const response = await fetch(`${API_BASE_URL}/activities`);
    if (!response.ok) throw new Error("Failed to fetch activities");
    return response.json();
  },

  // ============================
  //            USERS
  // ============================

  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },

  async getUserById(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },

  async createUser(userData) {
    const response = await fetch(`${API_BASE_URL}/users/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      // Try to extract more detailed error info from the server
      let details = "";
      try {
        const data = await response.json();
        details = data.message || JSON.stringify(data);
      } catch (e) {
        try {
          details = await response.text();
        } catch (ee) {
          details = response.statusText || "Unknown error";
        }
      }
      throw new Error(`Failed to create user: ${response.status} ${details}`);
    }

    return response.json();
  },

  async updateUser(id, userData) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) throw new Error("Failed to update user");
    return response.json();
  },

  async changeUserPassword(id, passwordData) {
    try {
      // Get token from AsyncStorage for authentication
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      const token = await AsyncStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      console.log("Making password change request to:", `${API_BASE_URL}/users/${id}/change-password`);
      console.log("Headers:", headers);
      console.log("Password data:", passwordData);

      const response = await fetch(
        `${API_BASE_URL}/users/${id}/change-password`,
        {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(passwordData),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        let errorMessage = "Failed to update password";
        try {
          const errorData = await response.json();
          console.error("Error response data:", errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          console.error("Error response text:", errorText);
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Password change response:", result);
      return result;
    } catch (error) {
      console.error("Password change API error:", error);
      throw error;
    }
  },

  async deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete user");
    return response.json();
  },

  async loginUser(email, password) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("Invalid credentials");
    return response.json();
  },

  // ============================
  //         CUSTOMERS
  // ============================

  // async getCustomers() {
  //   const response = await fetch(`${API_BASE_URL}/customers`);
  //   if (!response.ok) throw new Error("Failed to fetch customers");
  //   return response.json();
  // },

  // async getCustomerById(id) {
  //   const response = await fetch(`${API_BASE_URL}/customers/${id}`);
  //   if (!response.ok) throw new Error("Failed to fetch customer");
  //   return response.json();
  // },

  // async createCustomer(customerData) {
  //   const response = await fetch(`${API_BASE_URL}/customers/create`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(customerData),
  //   });

  //   if (!response.ok) {
  //     // Try to extract more detailed error info from the server
  //     let details = "";
  //     try {
  //       const data = await response.json();
  //       details = data.message || JSON.stringify(data);
  //     } catch (e) {
  //       try {
  //         details = await response.text();
  //       } catch (ee) {
  //         details = response.statusText || "Unknown error";
  //       }
  //     }
  //     throw new Error(details || "Failed to create customer");
  //   }
  //   return response.json();
  // },

  // async updateCustomer(id, customerData) {
  //   const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
  //     method: "PUT",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(customerData),
  //   });

  //   if (!response.ok) throw new Error("Failed to update customer");
  //   return response.json();
  // },

  // async deleteCustomer(id) {
  //   const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
  //     method: "DELETE",
  //   });

  //   if (!response.ok) throw new Error("Failed to delete customer");
  //   return response.json();
  // },

  // async changeCustomerPassword(id, passwordData) {
  //   const response = await fetch(
  //     `${API_BASE_URL}/customers/${id}/change-password`,
  //     {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(passwordData),
  //     }
  //   );

  //   if (!response.ok) throw new Error("Failed to change password");
  //   return response.json();
  // },

  // async loginCustomer(email, password) {
  //   const response = await fetch(`${API_BASE_URL}/customers/login`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email, password }),
  //   });

  //   if (!response.ok) throw new Error("Invalid credentials");
  //   return response.json();
  // },

  // ============================
  //          PROJECTS
  // ============================

  // async getProjects() {
  //   const response = await fetch(`${API_BASE_URL}/projects`);
  //   if (!response.ok) throw new Error("Failed to fetch projects");
  //   return response.json();
  // },

  async getProjectById(id) {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) throw new Error("Failed to fetch project");
    return response.json();
  },

  // async getProjectByCustomerId(customerId) {
  //   const res = await fetch(`${API_BASE_URL}/projects/customer/${customerId}`);
  //   if (!res.ok) throw new Error("Failed to fetch project");
  //   return res.json();
  // },

  // async createProject(projectData) {
  //   const response = await fetch(`${API_BASE_URL}/projects`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(projectData),
  //   });

  //   if (!response.ok) throw new Error("Failed to create project");
  //   return response.json();
  // },

  // async updateProject(id, projectData) {
  //   const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
  //     method: "PUT",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(projectData),
  //   });

  //   if (!response.ok) {
  //     let details = "";
  //     try {
  //       const data = await response.json();
  //       details = data.message || JSON.stringify(data);
  //     } catch (e) {
  //       try {
  //         details = await response.text();
  //       } catch (ee) {
  //         details = response.statusText || "Unknown error";
  //       }
  //     }
  //     throw new Error(details || "Failed to update project");
  //   }
  //   return response.json();
  // },

  // async deleteProject(id) {
  //   const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
  //     method: "DELETE",
  //   });

  //   if (!response.ok) throw new Error("Failed to delete project");
  //   return response.json();
  // },

  // ============================
  //           ORDERS
  // ============================

  async getOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) throw new Error("Failed to fetch orders");
    return response.json();
  },

  async getOrderById(id) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!response.ok) throw new Error("Failed to fetch order");
    return response.json();
  },

  // async getOrdersByCustomerId(customerId) {
  //   const response = await fetch(
  //     `${API_BASE_URL}/orders/customer/${customerId}`
  //   );
  //   if (!response.ok) throw new Error("Failed to fetch customer orders");
  //   return response.json();
  // },

  async getOrdersByUserId(userId) {
    const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`);

    const data = await response.json().catch(() => null); // handle invalid json

    if (!response.ok) {
      // pass backend message
      const msg = data?.message || "Failed to fetch user orders";
      throw new Error(msg);
    }

    return data;
  },


  async getOrdersByProjectId(projectId) {
    const response = await fetch(`${API_BASE_URL}/orders/project${projectId}`);
    if (!response.ok) throw new Error("Failed to fetch customer orders");
    return response.json();
  },

  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) throw new Error("Failed to create order");
    return response.json();
  },

  async updateOrder(id, orderData) {
    const isFormData = orderData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: "PUT",
      headers: isFormData ? {} : { "Content-Type": "application/json" },
      body: isFormData ? orderData : JSON.stringify(orderData),
    });

    if (!response.ok) throw new Error("Failed to update order");
    return response.json();
  },

  async deleteOrder(id) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete order");
    return response.json();
  },

  // ============================
  //           ASSETS
  // ============================

  async getAssets() {
    const response = await fetch(`${API_BASE_URL}/assets`);
    if (!response.ok) throw new Error("Failed to fetch assets");
    return response.json();
  },

  async getAssetById(id) {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`);
    if (!response.ok) throw new Error("Failed to fetch asset");
    return response.json();
  },

  async getAssetsByCustomerId(customerId) {
    const response = await fetch(
      `${API_BASE_URL}/assets/customer/${customerId}`
    );
    if (!response.ok) throw new Error("Failed to fetch customer assets");
    return response.json();
  },

  async getAssetsByProjectId(projectId) {
    const response = await fetch(`${API_BASE_URL}/assets/project/${projectId}`);
    if (!response.ok) throw new Error("Failed to fetch customer assets");
    return response.json();
  },
  async createAsset(assetData) {
    const response = await fetch(`${API_BASE_URL}/assets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assetData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create asset");
    }

    return response.json();
  },

  async updateAsset(id, assetData) {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assetData),
    });

    if (!response.ok) throw new Error("Failed to update asset");
    return response.json();
  },

  async deleteAsset(id) {
    const response = await fetch(`${API_BASE_URL}/assets/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete asset");
    return response.json();
  },

  // ============================
  //           TASKS
  // ============================

  async getTasks() {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) throw new Error("Failed to fetch tasks");
    return response.json();
  },

  async getTaskById(id) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    if (!response.ok) throw new Error("Failed to fetch task");
    return response.json();
  },

  async getTasksByProjectId(projectId) {
    const response = await fetch(`${API_BASE_URL}/tasks/project/${projectId}`);
    if (!response.ok) throw new Error("Failed to fetch project tasks");
    return response.json();
  },

  async getTasksByUserId(userId, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/tasks/user/${userId}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch user tasks");
    return response.json();
  },

  async createTask(taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) throw new Error("Failed to create task");
    return response.json();
  },

  async updateTask(id, taskData) {
    const isFormData = taskData instanceof FormData;
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: isFormData ? {} : { "Content-Type": "application/json" },
      body: isFormData ? taskData : JSON.stringify(taskData),
    });

    if (!response.ok) throw new Error("Failed to update task");
    return response.json();
  },

  async deleteTask(id) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete task");
    return response.json();
  },

  async changeTaskStatus(id, statusData) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/change-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(statusData),
    });

    if (!response.ok) throw new Error("Failed to change task status");
    return response.json();
  },
};
