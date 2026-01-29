import { getApiUrl } from "../../utils/getApiUrl";

const API_URL = getApiUrl();

const getHeader = () => {
  // const token = localStorage.getItem("accessToken");
  return {
    method: "GET",
    // headers: {
    //   Authorization: token && `Bearer ${token}`,
    // },
  };
};

const postHeader = (
  body: any,
  stringify: boolean = true,
  contentType?: any
) => {
  // const token = localStorage.getItem("accessToken");
  return {
    method: "POST",
    headers: {
      "Content-Type": body ? contentType || "application/json" : null,
      // Authorization: token && `Bearer ${token}`,
    },
    body: body ? (stringify ? JSON.stringify(body) : body) : null,
  };
};

const formDataHeader = (body: any, method = "POST") => {
  // const token = localStorage.getItem("accessToken");
  return {
    method,
    // headers: {
    //   Authorization: token && `Bearer ${token}`,
    // },
    body,
  };
};

const rolePostHeader = <T = object>(
  body: T | null,
  stringify: boolean = true,
  contentType: string = "application/json"
): RequestInit => {
  const headers: Record<string, string> = {};

  if (body) {
    headers["Content-Type"] = contentType;
  }

  // Uncomment and use this if you need authentication
  // const token = localStorage.getItem("accessToken");
  // if (token) {
  //   headers["Authorization"] = `Bearer ${token}`;
  // }

  return {
    method: "POST",
    headers,
    body: body ? (stringify ? JSON.stringify(body) : (body as BodyInit)) : null,
  };
};
const updateHeader = (
  body: any,
  stringify: boolean = true,
  contentType?: any
) => {
  // const token = localStorage.getItem("accessToken");
  return {
    method: "PUT",
    headers: {
      "Content-Type": body ? contentType || "application/json" : null,
      // Authorization: token && `Bearer ${token}`,
    },
    body: body ? (stringify ? JSON.stringify(body) : body) : null,
  };
};

const updateStatusHeader = (
  body: any,
  stringify: boolean = true,
  contentType?: any
) => {
  // const token = localStorage.getItem("accessToken");
  return {
    method: "PATCH",
    headers: {
      "Content-Type": body ? contentType || "application/json" : null,
      // Authorization: token && `Bearer ${token}`,
    },
    body: body ? (stringify ? JSON.stringify(body) : body) : null,
  };
};

const deleteHeader = () => {
  // const token = localStorage.getItem("accessToken");
  return {
    method: "DELETE",
    // headers: {
    //   Authorization: token && `Bearer ${token}`,
    // },
  };
};

///Cleaned Up Services for Bole Prosperity

//Subcity Registration

export const createSubcity = (body: any) => {
  return fetch(`${API_URL}subcities`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getSubcityById = (id: any) => {
  return fetch(`${API_URL}subcities/${id}`, getHeader()).then((res) =>
    res.json()
  );
};

export const updateSubcity = (id: number, body: any) => {
  return fetch(`${API_URL}subcities/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteSubcity = (id: any) => {
  return fetch(`${API_URL}subcities/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getAllSubcity = () => {
  return fetch(`${API_URL}subcities`, getHeader()).then((res) => res.json());
};

//Woreda Registration

export const getAllWoredas = () => {
  return fetch(`${API_URL}woreda-showers`, getHeader()).then((res) =>
    res.json()
  );
};

//Role

export const getAllRoles = () => {
  return fetch(`${API_URL}roles`, getHeader()).then((res) => res.json());
};
export const createRole = (body: any) => {
  return fetch(`${API_URL}roles`, postHeader(body)).then((res) => res.json());
};

export const updateRole = (id: number, body: any) => {
  return fetch(`${API_URL}roles/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};

export const deleteRole = (id: any) => {
  return fetch(`${API_URL}roles/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};
//video

export const postVideo = (body: any) => {
  return fetch(`${API_URL}videos`, postHeader(body)).then((res) => res.json());
};
export const getPostedVideos = () => {
  return fetch(`${API_URL}videos`, getHeader()).then((res) => res.json());
};

export const updatePostedVideo = (id: number, body: any) => {
  return fetch(`${API_URL}videos/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
// export const deletePosteVideo = (id: any) => {
//   return fetch(`${API_URL}videos/${id}`, deleteHeader()).then((res) =>
//     res.json()
//   );
// };

export const deletePosteVideo = (id: any) => {
  return fetch(`${API_URL}videos/${id}`, deleteHeader()).then(async (res) => {
    if (res.status === 204) {
      return null;
    }
    return res.json();
  });
};

//Users

export const getAllUsers = () => {
  return fetch(`${API_URL}users`, getHeader()).then((res) => res.json());
};

export const createUser = (body: any) => {
  return fetch(`${API_URL}users`, postHeader(body)).then((res) => res.json());
};

export const getUserById = (id: any) => {
  return fetch(`${API_URL}users/${id}`, getHeader()).then((res) => res.json());
};

export const updateUser = (id: number, body: any) => {
  return fetch(`${API_URL}users/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteUser = (id: any) => {
  return fetch(`${API_URL}users/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};
//approve User

export const updateUserStatus = (id: number, body: any) => {
  return fetch(`${API_URL}users/${id}/account-status`, updateHeader(body)).then(
    (res) => res.json()
  );
};

//Permissions

export const getAllPermissions = () => {
  return fetch(`${API_URL}permissions`, getHeader()).then((res) => res.json());
};

export const getRolePermissions = (id: any) => {
  return fetch(`${API_URL}roles/${id}/permissions/`, getHeader()).then((res) =>
    res.json()
  );
};

export const assignPermissionsToRole = (id: number, body: any) => {
  return fetch(`${API_URL}roles/${id}/permissions/`, updateHeader(body)).then(
    (res) => res.json()
  );
};

//needs to be checked

export const getDataByUrl = (url: any) => {
  return fetch(`${API_URL}${url}`, getHeader()).then((res) => res.json());
};

export const getAllEmployees = () => {
  return fetch(`${API_URL}employees?sort=created_at`, getHeader()).then((res) =>
    res.json()
  );
};
export const getPools = () => {
  return fetch(`${API_URL}pools`, getHeader()).then((res) => res.json());
};

export const createNewEmployee = (body: any) => {
  return fetch(`${API_URL}employees`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const login = async (body: any) => {
  const loginRes = await fetch(
    `${API_URL}auth/sign-in/email`,
    postHeader({ ...body, callbackURL: "" })
  );
  const loginData = await loginRes.json();

  if (!loginRes.ok || loginData?.code) {
    // Pass the login error through
    throw loginData;
  }

  // Call userDetail next
  const userData = await userDetail(loginData.user.id);

  loginData.user = { ...loginData.user, ...userData }

  // Return BOTH objects concatenated in one
  return loginData;
};


export const userDetail = (id: string) => {
  return fetch(`${API_URL}users/${id}`, getHeader()).then((res) => res.json());
};

export const createNewRole = (body: any) => {
  return fetch(`${API_URL}roles`, rolePostHeader(body)).then((res) =>
    res.json()
  );
};

export const createPool = (body: any) => {
  return fetch(`${API_URL}pools`, postHeader(body)).then((res) => res.json());
};

export const updatePool = (id: number, body: any) => {
  return fetch(`${API_URL}pools/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deletePool = (id: any) => {
  return fetch(`${API_URL}pools/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

// export const createEmployeeHistory = (body: any)=>{
//   return fetch (`${API_URL}employee-histories`, postHeader(body)).then((res)=> res.json())
// }

export const createEmployeeHistory = (body: any) => {
  return fetch(`${API_URL}employee-histories`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const resetPassword = (id: number, body: any) => {
  return fetch(`${API_URL}users/change-password/${id}`, postHeader(body)).then(
    (res) => res.json()
  );
};

export const updateEmployeeStatus = (id: number, body: any) => {
  return fetch(
    `${API_URL}employees/status/update/${id}`,
    updateStatusHeader(body)
  ).then((res) => res.json());
};

export const updateEmployee = (id: number, body: any) => {
  return fetch(`${API_URL}employees/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};

export const updateProfilePic = (id: number, body: any) => {
  return fetch(
    `${API_URL}employees/profile-pic/${id}`,
    updateStatusHeader(body)
  ).then((res) => res.json());
};

export const deleteEmployee = (id: any) => {
  return fetch(`${API_URL}employees/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

//News

export const createNews = (body: any) => {
  return fetch(`${API_URL}news`, postHeader(body)).then((res) => res.json());
};

export const getNews = () => {
  return fetch(`${API_URL}news`, getHeader()).then((res) => res.json());
};

export const getNewsById = (id) => {
  return fetch(`${API_URL}news/${id}`, getHeader()).then((res) => res.json());
};
export const updateNews = (id: number, body: any) => {
  return fetch(`${API_URL}news/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
//news comment

// services/api/main.ts

export const createNewsComment = (newsId: number, body: any) => {
  return fetch(`${API_URL}news/${newsId}/comment`, postHeader(body)).then(
    (res) => res.json()
  );
};

export const getNewsComments = (newsId: number) => {
  return fetch(`${API_URL}news/${newsId}/comment`, getHeader()).then((res) =>
    res.json()
  );
};

export const updateNewsComment = (
  newsId: number,
  commentId: number,
  body: any
) => {
  return fetch(
    `${API_URL}news/${newsId}/comment/${commentId}`,
    updateHeader(body)
  ).then((res) => res.json());
};

export const deleteNewsComment = (newsId: number, commentId: number) => {
  return fetch(
    `${API_URL}news/${newsId}/comment/${commentId}`,
    deleteHeader()
  ).then((res) => res.json());
};

// export const updateNewsCategory = (id: number, body: any) => {
//   return fetch(`${API_URL}news-categories/${id}`, updateHeader(body))
//     .then((res) => {
//       if (!res.ok) {
//         throw new Error("Failed to update news category");
//       }
//       return res.json();
//     });
// };
export const deleteNews = (id: any) => {
  return fetch(`${API_URL}news/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getAllNews = () => {
  return fetch(`${API_URL}news`, getHeader()).then((res) => res.json());
};

//News Category

export const createNewsCategory = (body: any) => {
  return fetch(`${API_URL}news-categories`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getNewsCategoryById = (id) => {
  return fetch(`${API_URL}news-categories/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
// export const updateNewsCategory = (id:number, body:any) => {
//   return fetch(`${API_URL}news-categories/${id}`, updateHeader(body)).then(
//     (res) => res.json()
//   );
// };
export const updateNewsCategory = (id: number, body: any) => {
  return fetch(`${API_URL}news-categories/${id}`, updateHeader(body)).then(
    (res) => {
      if (!res.ok) {
        throw new Error("Failed to update news category");
      }
      return res.json();
    }
  );
};
export const deleteNewsCategory = (id: any) => {
  return fetch(`${API_URL}news-categories/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getNewsCategories = () => {
  return fetch(`${API_URL}news-categories`, getHeader()).then((res) =>
    res.json()
  );
};

//Organizational Structure (At Federal Level)

export const createNewsorgStructure = (body: any) => {
  return fetch(`${API_URL}org-structure`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getorgStructureById = (id) => {
  return fetch(`${API_URL}org-structure/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updatorgStructure = (id: number, body: any) => {
  return fetch(`${API_URL}org-structure/${id}`, updateHeader(body)).then(
    (res) => res.json()
  );
};
export const deleteorgStructure = (id: any) => {
  return fetch(`${API_URL}org-structure/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getorgStructure = () => {
  return fetch(`${API_URL}org-structure`, getHeader()).then((res) =>
    res.json()
  );
};

//Regional Structure

export const createNewsorgStructureRegional = (body: any) => {
  return fetch(`${API_URL}regional-structures`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getorgStructureByIdRegional = (id) => {
  return fetch(`${API_URL}regional-structures/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updatorgStructureRegional = (id: number, body: any) => {
  return fetch(`${API_URL}regional-structures/${id}`, updateHeader(body)).then(
    (res) => res.json()
  );
};
export const deleteorgStructureRegional = (id: any) => {
  return fetch(`${API_URL}regional-structures/${id}`, deleteHeader()).then(
    (res) => res.json()
  );
};

export const getorgStructureRegional = () => {
  return fetch(`${API_URL}regional-structures`, getHeader()).then((res) =>
    res.json()
  );
};

//Subcity Structure

export const createNewsorgStructureSubcity = (body: any) => {
  return fetch(`${API_URL}sub-city-structures`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getorgStructureByIdSubcity = (id) => {
  return fetch(`${API_URL}sub-city-structures/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updatorgStructureSubcity = (id: number, body: any) => {
  return fetch(`${API_URL}sub-city-structures/${id}`, updateHeader(body)).then(
    (res) => res.json()
  );
};
export const deleteorgStructureSubcity = (id: any) => {
  return fetch(`${API_URL}sub-city-structures/${id}`, deleteHeader()).then(
    (res) => res.json()
  );
};

export const getorgStructureSubcity = () => {
  return fetch(`${API_URL}sub-city-structures`, getHeader()).then((res) =>
    res.json()
  );
};

//District Structure

export const createNewsorgStructureDistrict = (body: any) => {
  return fetch(`${API_URL}district-structures`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getorgStructureByIdDistrict = (id) => {
  return fetch(`${API_URL}district-structures/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updatorgStructureDistrict = (id: number, body: any) => {
  return fetch(`${API_URL}district-structures/${id}`, updateHeader(body)).then(
    (res) => res.json()
  );
};
export const deleteorgStructureDistrict = (id: any) => {
  return fetch(`${API_URL}district-structures/${id}`, deleteHeader()).then(
    (res) => res.json()
  );
};

export const getorgStructureDistrict = () => {
  return fetch(`${API_URL}district-structures`, getHeader()).then((res) =>
    res.json()
  );
};

//Family Discussion
export const createFamilyDiscussion = (body: any) => {
  return fetch(`${API_URL}family-discussions`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getFamilyDiscussionById = (id) => {
  return fetch(`${API_URL}family-discussions/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updatFamilyDiscussion = (id: number, body: any) => {
  return fetch(`${API_URL}family-discussions/${id}`, updateHeader(body)).then(
    (res) => res.json()
  );
};
export const deleteFamilyDiscussion = (id: any) => {
  return fetch(`${API_URL}family-discussions/${id}`, deleteHeader()).then(
    async (res) => {
      if (res.status === 204) {
        return null;
      }
      return res.json();
    }
  );
};

export const getFamilyDiscussion = (
  options: {
    path?: string;
    params?: Record<string, string | number>;
  } = {}
) => {
  const { path = "", params = {} } = options;

  const queryString = new URLSearchParams();

  // Add other params
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      queryString.append(key, String(value));
    }
  }

  const url = `${API_URL}family-discussions${path ? `/${path}` : ""
    }?${queryString}`;

  return fetch(url, getHeader()).then((res) => res.json());
};

//get trashed family discussions
export const getTrashedFamilyDiscussions = (
  options: {
    path?: string;
    params?: Record<string, string | number>;
  } = {}
) => {
  const { path = "", params = {} } = options;

  // Convert params to URLSearchParams (handles URL encoding)
  const queryString = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      queryString.append(key, String(value));
    }
  }

  const url = `${API_URL}family-discussions/trashed/all${path ? `/${path}` : ""
    }${queryString.toString() ? `?${queryString}` : ""}`;

  return fetch(url, getHeader()).then((res) => res.json());
};

//View All Permissions

export const viewAllPermission = () => {
  return fetch(`${API_URL}permissions`, getHeader()).then((res) => res.json());
};

// Password Reset

export const passwordReset = (id: string | number, body: any) => {
  return fetch(`${API_URL}password/reset?user_id=${id}`, postHeader(body)).then(
    (res) => res.json()
  );
};
// Visitor Counter

export const countVisitor = () => {
  return fetch(`${API_URL}visitors/count`, getHeader()).then((res) =>
    res.json()
  );
};

//All FILES API
const postFileHeader = (formData: FormData) => {
  return {
    method: "POST",
    headers: {},
    body: formData,
  };
};
export const uploadFile = (file: File, folder: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder); // Add folder parameter if needed by your API

  return fetch(`${API_URL}files`, {
    method: "POST",
    body: formData,
    // Don't set Content-Type header - let the browser set it with the boundary
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to upload file");
    }
    return data;
  });
};

export const getFilesById = (id) => {
  return fetch(`${API_URL}files/${id}`, getHeader()).then((res) => res.json());
};

export const getFiles = () => {
  return fetch(`${API_URL}files`, getHeader()).then((res) => res.json());
};

export const UpdateFile = (id: number, body: any) => {
  return fetch(`${API_URL}files/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteFile = (id: any) => {
  return fetch(`${API_URL}files/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

//orders
export const createOrders = (body: any) => {
  return fetch(`${API_URL}orders`, postHeader(body)).then((res) => res.json());
};

export const getAllOrders = () => {
  return fetch(`${API_URL}orders`, getHeader()).then((res) => res.json());
};

export const getOrdersByEmployeeId = (id) => {
  return fetch(`${API_URL}orders/${id}`, getHeader()).then((res) => res.json());
};

export const updateOrderStatus = (id: number, body: any) => {
  return fetch(`${API_URL}orders/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};

//Update by status

export const updateOrderbyStatus = (id: number, body: any) => {
  console.log("Id", id);
  console.log("Body", body);
  return fetch(`${API_URL}orders/update-status/${id}`, updateHeader(body)).then(
    (res) => res.json()
  );
};

//Food Menu

export const createFoodMenu = (body: any) => {
  return fetch(`${API_URL}food-menus`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const updateFoodMenu = (id: number, body: any) => {
  return fetch(`${API_URL}food-menus/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteFoodMenu = (id: any) => {
  return fetch(`${API_URL}food-menus/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getAllFoodMenu = () => {
  return fetch(`${API_URL}food-menus`, getHeader()).then((res) => res.json());
};

// Online Order

export const createOnlineOrder = (body: any) => {
  return fetch(`${API_URL}orders`, postHeader(body)).then((res) => res.json());
};

export const updateOnlineOrder = (id: number, body: any) => {
  return fetch(`${API_URL}orders/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteOnlineOrder = (id: any) => {
  return fetch(`${API_URL}orders/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getAllOnlineOrder = () => {
  return fetch(`${API_URL}orders`, getHeader()).then((res) => res.json());
};

//Carousel Img
export const createCarousel = (body: any) => {
  return fetch(`${API_URL}carousels`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getCarouselById = (id) => {
  return fetch(`${API_URL}carousels/${id}`, getHeader()).then((res) =>
    res.json()
  );
};

export const updateCarousel = (id: number, body: any) => {
  return fetch(`${API_URL}carousels/${id}`, updateHeader(body)).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to update carousel");
    }
    return res.json();
  });
};
export const deleteCarousel = (id: any) => {
  return fetch(`${API_URL}carousels/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getCarousels = () => {
  return fetch(`${API_URL}carousels`, getHeader()).then((res) => res.json());
};

//Officials
export const createOfficial = (body: any) => {
  return fetch(`${API_URL}officials`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getOfficialById = (id) => {
  return fetch(`${API_URL}officials/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updateOfficial = (id: number, body: any) => {
  return fetch(`${API_URL}officials/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteOfficial = (id: any) => {
  return fetch(`${API_URL}officials/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getOfficials = () => {
  return fetch(`${API_URL}officials`, getHeader()).then((res) => res.json());
};

//Counter
export const createCounter = (body: any) => {
  return fetch(`${API_URL}counters`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getCounterById = (id) => {
  return fetch(`${API_URL}counters/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updateCounter = (id: number, body: any) => {
  return fetch(`${API_URL}counters/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteCounter = (id: any) => {
  return fetch(`${API_URL}counters/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getCounters = () => {
  return fetch(`${API_URL}counters`, getHeader()).then((res) => res.json());
};

//Woreda
export const addWoreda = (body: any) => {
  return fetch(`${API_URL}woreda-showers`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getWoredaById = (id) => {
  return fetch(`${API_URL}woreda-showers/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updateWoreda = (id: number, body: any) => {
  return fetch(`${API_URL}woreda-showers/${id}`, updateHeader(body)).then(
    (res) => res.json()
  );
};
export const deleteWoreda = (id: any) => {
  return fetch(`${API_URL}woreda-showers/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getWoredas = () => {
  return fetch(`${API_URL}woreda-showers`, getHeader()).then((res) =>
    res.json()
  );
};

//Woreda Registration Api
export const createworeda = (body: any) => {
  return fetch(`${API_URL}woredas`, postHeader(body)).then((res) => res.json());
};

export const getworedasbyId = (id) => {
  return fetch(`${API_URL}woredas/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const UpdateWoredas = (id: number, body: any) => {
  return fetch(`${API_URL}woredas/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const DeleteWoredas = (id: any) => {
  return fetch(`${API_URL}woredas/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const GetAllWoredas = () => {
  return fetch(`${API_URL}woredas`, getHeader()).then((res) => res.json());
};

//Role Registration Api
export const createRoles = (body: any) => {
  return fetch(`${API_URL}roles`, postHeader(body)).then((res) => res.json());
};

export const removePermissions = (
  roleId: number,
  body: { permission_ids: number[] }
) => {
  return fetch(`${API_URL}remove/${roleId}`, postHeader(body)).then((res) =>
    res.json()
  );
};
export const getRolesById = (id) => {
  return fetch(`${API_URL}roles/${id}`, getHeader()).then((res) => res.json());
};
export const UpdateRoles = (id: number, body: any) => {
  return fetch(`${API_URL}roles/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const DeleteRoles = (id: any) => {
  return fetch(`${API_URL}roles/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const GetAllRoles = () => {
  return fetch(`${API_URL}roles`, getHeader()).then((res) => res.json());
};

//Role Assignemnt Api
export const AssignRole = (id: any, body: any) => {
  return fetch(`${API_URL}roles/${id}/permissions`, postHeader(body)).then(
    (res) => res.json()
  );
};

export const AssignSinglePermission = (id: any, body: any) => {
  return fetch(`${API_URL}roles/${id}/permissions`, postHeader(body)).then(
    (res) => res.json()
  );
};

export const GetAllAssignedRole = (id) => {
  return fetch(`${API_URL}roles/${id}/permissions`, getHeader()).then((res) =>
    res.json()
  );
};
export const RemoveSinglePermission = (id: any) => {
  return fetch(`${API_URL}roles/${id}/permissions`, deleteHeader()).then(
    (res) => res.json()
  );
};
export const RemovePermissions = (id: any) => {
  return fetch(`${API_URL}remove/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const RemoveMultiplePermissions = (ids: number[]) => {
  return fetch(`${API_URL}permissions/delete-multiple`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...deleteHeader(),
    },
    body: JSON.stringify({
      permission_ids: ids,
    }),
  }).then((res) => res.json());
};
//Team Member
export const addTeamMember = (body: any) => {
  return fetch(`${API_URL}team-members`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getTeamMemberById = (id) => {
  return fetch(`${API_URL}team-members/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updateTeamMember = (id: any, body: any) => {
  return fetch(`${API_URL}team-members/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteTeamMember = (id: any) => {
  return fetch(`${API_URL}team-members/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getTeamMembers = () => {
  return fetch(`${API_URL}team-members`, getHeader()).then((res) => res.json());
};

//User Api
export const addUsers = (body: any) => {
  return fetch(`${API_URL}users`, postHeader(body)).then((res) => res.json());
};

export const getUsersById = (id) => {
  return fetch(`${API_URL}users/${id}`, getHeader()).then((res) => res.json());
};
export const updateUsers = (id: number, body: any) => {
  return fetch(`${API_URL}users/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteUsers = (id: any) => {
  return fetch(`${API_URL}users/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getUsers = () => {
  return fetch(`${API_URL}users`, getHeader()).then((res) => res.json());
};

//Announcement Member
export const createAnnouncement = (body: any) => {
  return fetch(`${API_URL}announcements`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getAnnouncementById = (id) => {
  return fetch(`${API_URL}announcements/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updateAnnouncement = (id: number, body: any) => {
  return fetch(`${API_URL}announcements/${id}`, updateHeader(body)).then(
    (res) => res.json()
  );
};
export const deleteAnnouncement = (id: any) => {
  return fetch(`${API_URL}announcements/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getAnnouncements = () => {
  return fetch(`${API_URL}announcements`, getHeader()).then((res) =>
    res.json()
  );
};

//Tender
export const createTender = (body: any) => {
  return fetch(`${API_URL}tenders`, postHeader(body)).then((res) => res.json());
};

export const getTenderById = (id) => {
  return fetch(`${API_URL}tenders/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updateTender = (id: number, body: any) => {
  return fetch(`${API_URL}tenders/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteTender = (id: any) => {
  return fetch(`${API_URL}tenders/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getTenders = () => {
  return fetch(`${API_URL}tenders`, getHeader()).then((res) => res.json());
};

//Tendency
export const createTendency = (body: any) => {
  return fetch(`${API_URL}tendencies/list`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const createActualTendency = (body: any) => {
  return fetch(`${API_URL}tendencies`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getTendencyById = (id) => {
  return fetch(`${API_URL}tendencies/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updateTendency = (id: number, body: any) => {
  return fetch(`${API_URL}tendencies/${id}/edit`, updateHeader(body)).then(
    (res) => res.json()
  );
};

// export const deleteTendency = (id: any) => {
//   return fetch(`${API_URL}tendencies/${id}/delete`, deleteHeader()).then(
//     (res) => res.json()
//   );
// };

export const getTrashedTendencies = (
  params: Record<string, string | number> = {}
) => {
  const queryString = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      queryString.append(key, String(value));
    }
  }
  const url = `${API_URL}tendencies/trashed${queryString.toString() ? `?${queryString}` : ""
    }`;
  return fetch(url, getHeader()).then((res) => res.json());
};

export const deleteTendency = (data: { id: number; user_id: number }) => {
  return fetch(`${API_URL}tendencies/${data.id}/delete`, {
    ...deleteHeader(),
    method: "DELETE",
    body: JSON.stringify({ user_id: data.user_id }),
  }).then((res) => res.json());
};

export const getTendency = () => {
  return fetch(`${API_URL}tendencies`, getHeader()).then((res) => res.json());
};

//
export const getNewsStats = () => {
  return fetch(`${API_URL}news`, getHeader()).then((res) => res.json());
};

export const getTrashedNews = (
  params: Record<string, string | number> = {}
) => {
  const queryString = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      queryString.append(key, String(value));
    }
  }
  const url = `${API_URL}news/trashed${queryString.toString() ? `?${queryString}` : ""
    }`;
  return fetch(url, getHeader()).then((res) => res.json());
};

//Report

export const getTendencyReport = () => {
  return fetch(`${API_URL}tendencies/report`, getHeader()).then((res) =>
    res.json()
  );
};

export const getAllTendencyReport = async (
  params: {
    start_date?: string;
    end_date?: string;
    type?: string;
    district?: string;
    limit?: number;
    page?: number;
    sort_by?: string;
    sort_order?: string;
    institution_name?: string;
    user_id?: string;
    search?: string;
  } = {}
) => {
  const response = await fetch(`${API_URL}tendencies/reports/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // ...getHeader(),
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tendency reports");
  }

  return response.json();
};

//below is used to get all the reposrt by sending user all the user id
export const createTendencyReport = (body: any) => {
  return fetch(`${API_URL}tendencies/report`, postHeader(body)).then((res) =>
    res.json()
  );
};

//Events
export const createEvent = (body: any) => {
  return fetch(`${API_URL}events`, postHeader(body)).then((res) => res.json());
};

export const getEventById = (id) => {
  return fetch(`${API_URL}events/${id}`, getHeader()).then((res) => res.json());
};
export const updateEvent = (id: number, body: any) => {
  return fetch(`${API_URL}events/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteEvent = (id: any) => {
  return fetch(`${API_URL}events/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getEvents = () => {
  return fetch(`${API_URL}events`, getHeader()).then((res) => res.json());
};

//Books
export const createBook = (body: any) => {
  return fetch(`${API_URL}books`, postHeader(body)).then((res) => res.json());
};

export const getBookById = (id) => {
  return fetch(`${API_URL}books/${id}`, getHeader()).then((res) => res.json());
};
export const updateBook = (id: number, body: any) => {
  return fetch(`${API_URL}books/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteBook = (id: any) => {
  return fetch(`${API_URL}books/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getBooks = () => {
  return fetch(`${API_URL}books`, getHeader()).then((res) => res.json());
};

export const getTrashedBooks = (
  params: Record<string, string | number> = {}
) => {
  const queryString = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      queryString.append(key, String(value));
    }
  }
  const url = `${API_URL}books/trashed${queryString.toString() ? `?${queryString}` : ""
    }`;
  return fetch(url, getHeader()).then((res) => res.json());
};

//Subcity Officials
export const createSubcityOfficial = (body: any) => {
  return fetch(`${API_URL}subcity-officials`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getSubcityOfficialById = (id) => {
  return fetch(`${API_URL}subcity-officials/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updateSubcityOfficial = (id: number, body: any) => {
  return fetch(`${API_URL}subcity-officials/${id}`, updateHeader(body)).then(
    (res) => res.json()
  );
};
export const deleteSubcityOfficial = (id: any) => {
  return fetch(`${API_URL}subcity-officials/${id}`, deleteHeader()).then(
    (res) => res.json()
  );
};

export const getSubcityOfficials = () => {
  return fetch(`${API_URL}subcity-officials`, getHeader()).then((res) =>
    res.json()
  );
};

//Subcity Officials
export const createPartner = (body: any) => {
  return fetch(`${API_URL}partners`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getPartnerById = (id) => {
  return fetch(`${API_URL}partners/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updatePartner = (id: number, body: any) => {
  return fetch(`${API_URL}partners/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deletePartner = (id: any) => {
  return fetch(`${API_URL}partners/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getPartners = () => {
  return fetch(`${API_URL}partners`, getHeader()).then((res) => res.json());
};

//Gallery

export const createGallery = (body: any) => {
  return fetch(`${API_URL}galleries`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getGalleryById = (id) => {
  return fetch(`${API_URL}galleries/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updateGallery = (id: number, body: any) => {
  return fetch(`${API_URL}galleries/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteGallery = (id: any) => {
  return fetch(`${API_URL}galleries/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getGalleries = () => {
  return fetch(`${API_URL}galleries`, getHeader()).then((res) => res.json());
};

//Contacts

export const createContact = (body: any) => {
  return fetch(`${API_URL}contacts`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const updateContact = (id: number, body: any) => {
  return fetch(`${API_URL}contacts/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};

export const deleteContact = (id: any) => {
  return fetch(`${API_URL}contacts/${id}`, deleteHeader()).then(async (res) => {
    if (res.status === 204) {
      return null;
    }
    return res.json();
  });
};

export const getAllContact = () => {
  return fetch(`${API_URL}contacts`, getHeader()).then((res) => res.json());
};

//Compliant

export const createCompliant = (body: any) => {
  return fetch(`${API_URL}complaints`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const updateCompliant = (id: number, body: any) => {
  return fetch(`${API_URL}complaints/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
// export const deleteCompliant = (id: any) => {
//   return fetch(`${API_URL}complaints/${id}`, deleteHeader()).then((res) =>
//     res.json()
//   );
// };

export const deleteCompliant = (id: any) => {
  return fetch(`${API_URL}complaints/${id}`, deleteHeader()).then(
    async (res) => {
      if (res.status === 204) {
        return null;
      }
      return res.json();
    }
  );
};

export const getAllCompliant = () => {
  return fetch(`${API_URL}complaints`, getHeader()).then((res) => res.json());
};

//exhibitions

export const createExhibitions = (body: any) => {
  return fetch(`${API_URL}exhibitions`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const updateExhibitions = (id: number, body: any) => {
  return fetch(`${API_URL}exhibitions/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const deleteExhibitions = (id: any) => {
  return fetch(`${API_URL}exhibitions/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getAllExhibitions = () => {
  return fetch(`${API_URL}exhibitions`, getHeader()).then((res) => res.json());
};

//Visitor Register and Report
export const registerVisitor = (body: any) => {
  return fetch(`${API_URL}visitors/register`, postHeader(body)).then((res) =>
    res.json()
  );
};
export const getExhibitionReport = () => {
  return fetch(`${API_URL}visitors/reports`, getHeader()).then((res) =>
    res.json()
  );
};

export const verifyVisitor = (body: any) => {
  return fetch(`${API_URL}visitors/login`, postHeader(body)).then((res) =>
    res.json()
  );
};

///

export const trackImageView = () => {
  return fetch(`${API_URL}visitors/reports`, getHeader()).then((res) =>
    res.json()
  );
};

export const trackView = () => {
  return fetch(`${API_URL}visitors/reports`, getHeader()).then((res) =>
    res.json()
  );
};

// change compliant status

export const changeCompliantStatus = (id: number, body: any) => {
  return fetch(
    `${API_URL}complaints/${id}/change-status`,
    postHeader(body)
  ).then((res) => res.json());
};

//compliant response

export const createCompliantResponse = (body: any) => {
  return fetch(`${API_URL}complaint-responses`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const updateCompliantResponse = (id: number, body: any) => {
  return fetch(`${API_URL}complaint-responses/${id}`, updateHeader(body)).then(
    (res) => res.json()
  );
};
export const deleteCompliantResponse = (id: any) => {
  return fetch(`${API_URL}complaint-responses/${id}`, deleteHeader()).then(
    (res) => res.json()
  );
};

export const getAllCompliantResponse = () => {
  return fetch(`${API_URL}complaint-responses`, getHeader()).then((res) =>
    res.json()
  );
};

//get response of compliant

export const getCompliantResponseById = (id: number, phoneNumber: any) => {
  return fetch(
    `${API_URL}complaint-response-by-complaint-id/${id}/${phoneNumber}`,
    getHeader()
  ).then((res) => res.json());
};

// export const getCompliantResponseById = (id) => {
//   return fetch(
//     `${API_URL}complaint-response-by-complaint-id/${id}`,
//     getHeader()
//   ).then((res) => res.json());
// };
//

//getCompliantResponseById
export const createNewFinanceReport = (body: any) => {
  return fetch(`${API_URL}finance-reports`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const updateFinanceReport = (id: number, body: any) => {
  return fetch(
    `${API_URL}finance-reports/update-report/${id}`,
    updateHeader(body)
  ).then((res) => res.json());
};

export const deleteFinanceReport = (id) => {
  return fetch(
    `${API_URL}finance-reports/delete-report/${id}`,
    deleteHeader()
  ).then((res) => res.json());
};

export const getEmployeeById = (id) => {
  return fetch(`${API_URL}employees/${id}`, getHeader()).then((res) =>
    res.json()
  );
};

export const getEmployeeBarcodeById = (id: any) => {
  return fetch(`${API_URL}get-qrcode/${id}`, getHeader()).then((res) =>
    res.text()
  );
};

export const getEmployeeCurrentSubsidyStatusById = (id: any) => {
  return fetch(
    `${API_URL}cafeteria-transactions/today/employee/${id}`,
    getHeader()
  ).then((res) => res.json());
};

export const generateQRCodeByEmployeeId = (id: any) => {
  return fetch(`${API_URL}generate-qrcode/${id}`, postHeader(id)).then((res) =>
    res.json()
  );
};

export const createSubsidyAllocation = (body: any) => {
  return fetch(`${API_URL}subsidy-allocations`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const createCafeteriaTransaction = (body) => {
  return fetch(`${API_URL}cafeteria-transactions`, postHeader(body)).then(
    (res) => res.json()
  );
};

export const getAllSubsidyAllAllocations = () => {
  return fetch(`${API_URL}subsidy-allocations`, getHeader()).then((res) =>
    res.json()
  );
};

export const getAllSubsidyAllocationsbyEmployeeId = (id) => {
  return fetch(
    `${API_URL}subsidy-allocations/employee/${id}/active`,

    getHeader()
  ).then((res) => res.json());
};

export const getAllCafeteriaTransactions = () => {
  return fetch(`${API_URL}cafeteria-transactions`, getHeader()).then((res) =>
    res.json()
  );
};

export const getCafeteriaTransactionsByEmployeeId = (id) => {
  return fetch(
    `${API_URL}cafeteria-transactions/employee/${id}`,
    getHeader()
  ).then((res) => res.json());
};

export const getCafeTransactionsByCafeAdminId = (id) => {
  return fetch(
    `${API_URL}cafeteria-transactions/get-by-cafe-admin-id/${id}`,
    getHeader()
  ).then((res) => res.json());
};

export const getReportByParam = (para: any) => {
  return fetch(
    `${API_URL}finance-reports/get-report/${para}`,
    getHeader()
  ).then((res) => res.json());
};

export const getReportByEmployee = ({ para, id }: any) => {
  return fetch(
    `${API_URL}finance-reports/get-report-by-employee/${id}/${para}`,
    getHeader()
  ).then((res) => res.json());
};

export const getSubsidyReportByParams = (body: any) => {
  return fetch(
    `${API_URL}finance-reports/subsidy-allocation/get-by-params`,
    postHeader(body)
  ).then((res) => res.json());
};

export const getCafeReportByParams = (body: any) => {
  return fetch(
    `${API_URL}finance-reports/get-by-params`,
    postHeader(body)
  ).then((res) => res.json());
};

export const getMonthlyReportByParams = ({
  empId,
  month,
}: {
  empId: string;
  month: string;
}) => {
  return fetch(
    `${API_URL}finance-reports/get-report-by-employee-id/staff/${empId}/monthly/${month}`,
    getHeader()
  ).then((res) => res.json());
};

export const getDailyReportByParams = ({
  cafeStaffId,
  day,
}: {
  cafeStaffId: string;
  day: string;
}) => {
  return fetch(
    `${API_URL}get-report-by-cafeteria-staff/${cafeStaffId}/daily/${day}`,
    getHeader()
  ).then((res) => res.json());
};

export const createFolder = (userId: number, body: any) => {
  return fetch(`${API_URL}users/${userId}/folders`, postHeader(body)).then(
    (res) => res.json()
  );
};
export const deleteDocument = (userId: number, documentId: number) => {
  return fetch(
    `${API_URL}users/${userId}/documents/${documentId}`,
    deleteHeader()
  ).then((res) => res.json());
};
export const getFolder = (userId: number) => {
  return fetch(`${API_URL}users/${userId}/folders`, getHeader()).then((res) =>
    res.json()
  );
};
export const fetchChildFolders = (userId: number, folderId: number) => {
  return fetch(
    `${API_URL}folders/${userId}/child/${folderId}`,
    getHeader()
  ).then((res) => res.json());
};
export const shareFolder = (userId: number, body: any) => {
  return fetch(
    `${API_URL}users/${userId}/folders/shares`,
    postHeader(body)
  ).then((res) => res.json());
};

export const getFolderSharedWith = (userId: number, folderId: number) => {
  return fetch(
    `${API_URL}users/${userId}/folders/shares/${folderId}`,
    getHeader()
  ).then((res) => res.json());
};
export const uploadFilesToFolders = (userId: number, body: any) => {
  return fetch(
    `${API_URL}users/${userId}/documents`,
    postFileHeader(body)
  ).then((res) => res.json());
};

export const getFolderContents = (userId: number, folderId: number) => {
  return fetch(
    `${API_URL}users/${userId}/folders/${folderId}`,
    getHeader()
  ).then((res) => res.json());
};
export const shareDocument = (userId: number, body: any) => {
  return fetch(
    `${API_URL}users/${userId}/documents/shares`,
    postHeader(body)
  ).then((res) => res.json());
};
export const getDocumentSharedWith = (userId: number, documentId: number) => {
  return fetch(
    `${API_URL}users/${userId}/documents/shares/${documentId}`,
    getHeader()
  ).then((res) => res.json());
};
export const createStaffUsers = (body: any) => {
  return fetch(`${API_URL}accounts`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getUserAccounts = () => {
  return fetch(`${API_URL}accounts`, getHeader()).then((res) => res.json());
};
export const getUserAccountsById = (id: any) => {
  const apiUrl = `${API_URL}accounts/${id}`;
  return fetch(apiUrl, getHeader()).then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  });
};

export const updateStaffUsers = (id: number, body: any) => {
  return fetch(`${API_URL}accounts/${id}`, updateHeader(body)).then((res) =>
    res.json()
  );
};
export const updateFolderName = (id: number, body: any) => {
  return fetch(`${API_URL}folders/${id}/rename`, updateHeader(body)).then(
    (res) => res.json()
  );
};
export const deleteStaffUser = (id: any) => {
  return fetch(`${API_URL}accounts/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};
export const deleteFolder = (id: any) => {
  console.log("id", id);
  return fetch(`${API_URL}folders/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};
export const markAsRead = (notificationid: any) => {
  return fetch(`${API_URL}notifications/mark-as-read/${notificationid}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};

export const getUserNotifications = (userid: any) => {
  return fetch(`${API_URL}notifications?userid=${userid}`, getHeader()).then(
    (res) => res.json()
  );
};

export const createQuestionnaire = (body: any) => {
  return fetch(`${API_URL}questionnaires`, postHeader(body)).then((res) =>
    res.json()
  );
};

export const getQuestionnaires = () => {
  return fetch(`${API_URL}questionnaires`, getHeader()).then((res) =>
    res.json()
  );
};

export const getQuestionnaireById = (id: string) => {
  return fetch(`${API_URL}questionnaires/${id}`, getHeader()).then((res) =>
    res.json()
  );
};

export const updateQuestionnaire = (id: number, body: any) => {
  return fetch(`${API_URL}questionnaires/${id}`, updateHeader(body)).then(
    (res) => res.json()
  );
};

export const deleteQuestionnaire = (id: string, questionId: string) => {
  return fetch(
    `${API_URL}questionnaires/${id}/questions/${questionId}/soft-delete`,
    deleteHeader()
  ).then((res) => res.json());
};

export const getQuestions = (questionnaireId: string) => {
  return fetch(
    `${API_URL}questionnaires/${questionnaireId}/questions`,
    getHeader()
  ).then((res) => res.json());
};

export const createQuestion = (questionnaireId: string, body: any) => {
  return fetch(
    `${API_URL}questionnaires/${questionnaireId}/questions`,
    postHeader(body)
  ).then((res) => res.json());
};
export const publishQuestionnaires = (questionnaireId: string) => {
  return fetch(`${API_URL}questionnaires/${questionnaireId}/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
};
export const getQuestionById = (id: string) => {
  return fetch(`${API_URL}questions/${id}`, getHeader()).then((res) =>
    res.json()
  );
};

export const getTrashedQuestionnaires = (
  options: {
    path?: string;
    params?: Record<string, string | number>;
  } = {}
) => {
  const { path = "", params = {} } = options;

  // Convert params to URLSearchParams (handles URL encoding)
  const queryString = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      queryString.append(key, String(value));
    }
  }

  const url = `${API_URL}questions/trashed${path ? `/${path}` : ""}${queryString.toString() ? `?${queryString}` : ""
    }`;

  return fetch(url, getHeader()).then((res) => res.json());
};

export const unpublishQuestionnaires = (id: string) => {
  return fetch(`${API_URL}questionnaires/${id}/draft`, {
    method: "PUT",
  }).then((res) => res.json());
};

export const updateQuestion = (questionId: string, body: any) => {
  return fetch(`${API_URL}questions/${questionId}`, updateHeader(body)).then(
    (res) => {
      if (!res.ok) {
        throw new Error("Failed to update question");
      }
      return res.json();
    }
  );
};
export const deleteQuestion = (id: string) => {
  return fetch(`${API_URL}questions/${id}`, deleteHeader()).then((res) =>
    res.json()
  );
};

export const getAnswers = (questionnaireId: string, userId: string) => {
  return fetch(
    `${API_URL}questionnaires/${questionnaireId}/answers?user_id=${userId}`,
    getHeader()
  ).then((res) => res.json());
};

export const submitAnswer = (
  questionnaireId: string,
  questionId: string,
  body: any
) => {
  return fetch(
    `${API_URL}questionnaires/${questionnaireId}/questions/${questionId}/answers`,
    postHeader(body)
  ).then((res) => res.json());
};

export const getAnswerById = (id: string) => {
  return fetch(`${API_URL}answers/${id}`, getHeader()).then((res) =>
    res.json()
  );
};
export const updateAvatar = (userId: string, body: any) => {
  return fetch(`${API_URL}users/${userId}/avatar`, updateHeader(body)).then(
    (res) => {
      if (!res.ok) {
        throw new Error("Failed to update question");
      }
      return res.json();
    }
  );
};
export const saveResults = (questionnaireId: string, body: any) => {
  return fetch(
    `${API_URL}questionnaires/${questionnaireId}/results`,
    postHeader(body)
  ).then((res) => res.json());
};

export const getResults = (questionnaireId: string, userId: string) => {
  return fetch(
    `${API_URL}questionnaires/${questionnaireId}/results?user_id=${userId}`,
    getHeader()
  ).then((res) => res.json());
};

export const getResultDetails = (questionnaireId: string, resultId: string) => {
  return fetch(
    `${API_URL}questionnaires/${questionnaireId}/results/${resultId}`,
    getHeader()
  ).then((res) => res.json());
};
export const getAllResults = async (
  filters: {
    filters?: {
      min_points?: number;
      max_percentage?: number;
      date_from?: string;
      date_to?: string;
    };
    sort?: {
      field?: string;
      direction?: "asc" | "desc";
    };
    with_user?: boolean;
  } = {}
) => {
  const response = await fetch(`${API_URL}questionnaire-results/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // ...getHeader(),
    },
    body: JSON.stringify(filters),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch questionnaire results");
  }

  return response.json();
};

// Create a group conversation
export const createGroupConversation = async (body: {
  user_id: number;
  user_ids: number[];
  is_group: true;
  name: string;
  description?: string;
}) => {
  const res = await fetch(`${API_URL}conversations`, postHeader(body));
  return await res.json();
};

// Create a private conversation
export const createPrivateConversation = async (body: {
  user_id: number;
  user_ids: number[];
}) => {
  const res = await fetch(`${API_URL}conversations`, postHeader(body));
  return await res.json();
};

// Add members to a group
export const addGroupParticipants = async (
  conversationId: number,
  body: { user_id: number; user_ids: number[] }
) => {
  const res = await fetch(
    `${API_URL}conversations/${conversationId}/participants`,
    postHeader(body)
  );
  return await res.json();
};

// Send a message to a conversation
export const sendConversationMessage = async (
  conversationId: number,
  body: { user_id: number; body: string; type: string }
) => {
  const res = await fetch(
    `${API_URL}conversations/${conversationId}/messages`,
    postHeader(body)
  );
  return await res.json();
};

// Get all conversations for a user
export const getUserConversations = async (user_id: number) => {
  const res = await fetch(
    `${API_URL}conversations?user_id=${user_id}`,
    getHeader()
  );
  return await res.json();
};

// Get messages in a conversation
export const getConversationMessages = async (
  conversationId: number,
  user_id: number
) => {
  const res = await fetch(
    `${API_URL}conversations/${conversationId}/messages?user_id=${user_id}`,
    getHeader()
  );
  return await res.json();
};
