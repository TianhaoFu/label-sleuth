/*
    Copyright (c) 2022 IBM Corp.
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../config";
import { client } from "../api/client";

const initialState = {
  authenticationEnabled: null,
  loading: false,
  fetched: false,
};

export const fetchFeatureFlags = createAsyncThunk(
  "workspaces/fetchFeatureFlags",
  async () => {
    const url = `${BASE_URL}/feature_flags`;
    const { data: featureFlags } = await client.get(url)
    return featureFlags;
  }
);

export const featureFlagsSlice = createSlice({
  name: "featureFlags",
  initialState,
  extraReducers: {
    [fetchFeatureFlags.pending]: (state) => {
      state.loading = true;
    },
    [fetchFeatureFlags.fulfilled]: (state, { payload }) => {
      const featureFlags = payload;
      return {
        ...state,
        loading: false,
        fetched: true,
        authenticationEnabled: featureFlags["login_required"],
      };
    },
    [fetchFeatureFlags.rejected]: (state, { error }) => {
      state.loading = false;
    },
  },
});

export const featureFlagsReducer = featureFlagsSlice.reducer;
