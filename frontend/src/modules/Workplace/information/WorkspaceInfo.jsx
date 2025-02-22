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

import * as React from "react";
import { useCallback, useRef } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import sleuth_logo from "../../../assets/sleuth_logo_white.svg";
import info_icon from "../../../assets/workspace/help.svg";
import logout_icon from "../../../assets/workspace/logout.svg";
import workspace_icon from "../../../assets/workspace/change_catalog.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadLabels,
  uploadLabels,
  checkModelUpdate,
  setWorkspaceId,
} from "../redux/DataSlice";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { TextField } from "@mui/material";
import { Tooltip } from "@mui/material";
import useLogOut from "../../../customHooks/useLogOut";
import { useNavigate } from "react-router-dom";
import classes from "./WorkspaceInfo.module.css";
import { WORKSPACE_CONFIG_PATH } from "../../../config";
import { toast } from "react-toastify";
import {
  LOGOUT_TOOLTIP_MSG,
  GO_TO_WORKSPACE_CONFIG_TOOLTIP_MSG,
  NO_MODEL_AVAILABLE_MSG,
  LABEL_SLEUTH_SHORT_DESC,
  NEXT_MODEL_TRAINING_MSG,
} from "../../../const";
import LinearWithValueLabel from "./ModelProgressBar";
import { Link } from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import {
  UploadLabelsDialog,
  DownloadLabelsDialog,
  DownloadModelDialog,
} from "./FileTransferLabels/TransferLabelsDialog";
import { getOrdinalSuffix } from "../../../utils/utils";
import useAuthentication from "../../Login/customHooks/useAuthentication";

const drawerWidth = 280; // left navigation panel width

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 2),
  ...theme.mixins.toolbar,
}));

const Divider = styled("div")(() => ({
  borderTop: "solid 1px #393939",
}));

const StatsContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  fontSize: 14,
  justifyContent: "space-between",
  paddingTop: theme.spacing(1),
}));

const AccountInfo = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2, 2),
}));

const ModelName = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "start",
  padding: theme.spacing(1, 2),
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const WorkspaceInfo = ({
  workspaceId,
  setTutorialOpen,
  checkModelInterval = 2000,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { logout } = useLogOut();

  const curCategory = useSelector((state) => state.workspace.curCategory);
  const labelCount = useSelector((state) => state.workspace.labelCount);
  const uploadedLabels = useSelector((state) => state.workspace.uploadedLabels);
  const modelVersion = useSelector((state) => state.workspace.modelVersion);
  const nextModelShouldBeTraining = useSelector(
    (state) => state.workspace.nextModelShouldBeTraining
  );

  const modelVersionSuffix = React.useMemo(
    () => getOrdinalSuffix(modelVersion),
    [modelVersion]
  );

  const [tabValue, setTabValue] = React.useState(0);
  const [uploadLabelsDialogOpen, setUploadLabelsDialogOpen] =
    React.useState(false);
  const [downloadLabelsDialogOpen, setDownloadLabelsDialogOpen] =
    React.useState(false);
  const [downloadModelDialogOpen, setDownloadModelDialogOpen] =
    React.useState(false);
  const refAnimationInstance = useRef(null);

  // this state is used to not display the new model notififications the first time the model version is set
  const [modelVersionHasBeenSet, setModelVersionHasBeenSet] =
    React.useState(false);

  const { authenticationEnabled } = useAuthentication();

  function notifySuccess(message, toastId, autoClose = false) {
    toast(message, {
      autoClose: autoClose,
      type: toast.TYPE.SUCCESS,
      toastId: toastId,
    });
  }

  React.useEffect(() => {
    if (curCategory !== null) {
      if (!modelVersionHasBeenSet) {
        setModelVersionHasBeenSet(true);
      }
      if (modelVersion && modelVersion > -1 && modelVersionHasBeenSet) {
        fire();
        if (modelVersion === 1) {
          notifySuccess("A new model is available!", "toast-new-model");
          notifySuccess(
            "There are new suggestions for labeling!",
            "toast-new-suggestions-for-labelling"
          );
        }
      }
    }
  }, [modelVersion]);

  React.useEffect(() => {
    if (workspaceId) {
      dispatch(setWorkspaceId(workspaceId));
    }
  }, [workspaceId]);

  const getInstance = useCallback((instance) => {
    refAnimationInstance.current = instance;
  }, []);

  const makeShot = useCallback((particleRatio, opts) => {
    refAnimationInstance.current &&
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(100 * particleRatio),
        colors: ["#BE3092", "#166CFF", "#8ECCF3", "#88A8FB"],
      });
  }, []);

  const fire = useCallback(() => {
    makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    makeShot(0.2, {
      spread: 60,
    });

    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [makeShot]);

  const dispatch = useDispatch();

  /**
   * Update the model state every checkModelInterval milliseconds
   * Do it only if nextModelShouldBeTraining is true
   */
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (curCategory != null && nextModelShouldBeTraining) {
        dispatch(checkModelUpdate());
      }
    }, checkModelInterval);

    return () => clearInterval(interval);
  }, [curCategory, checkModelInterval, nextModelShouldBeTraining]);

  React.useEffect(() => {
    setModelVersionHasBeenSet(false);
  }, [curCategory]);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // placeholder for finding documents stats
  let doc_stats = {
    pos: labelCount.documentPos,
    neg: labelCount.documentNeg,
  };

  // placeholder for finding workspace  stats
  let workspace_stats = {
    pos: labelCount.workspacePos,
    neg: labelCount.workspaceNeg,
  };

  const open_introSlides = function () {
    setTutorialOpen(true);
  };

  const getCategoriesString = (categories) => {
    if (categories.length === 1) return categories[0];
    else {
      let res = "";
      if (categories.length > 2)
        categories.slice(0, -2).forEach((c) => (res += `${c}, `));
      res += categories.slice(-2, -1)[0] + " and " + categories.slice(-1)[0];
      return res;
    }
  };

  React.useEffect(() => {
    if (uploadedLabels) {
      const categoriesCreated = uploadedLabels.categoriesCreated;
      const createdCategoriesMessage = categoriesCreated.length
        ? `Added categories are ${getCategoriesString(categoriesCreated)}`
        : "";
      notifySuccess(
        `New labels have been added! ${createdCategoriesMessage}`,
        "toast-uploaded-labels"
      );
    }
  }, [uploadedLabels]);

  return (
    <>
      <UploadLabelsDialog
        open={uploadLabelsDialogOpen}
        setOpen={setUploadLabelsDialogOpen}
      />
      <DownloadLabelsDialog
        open={downloadLabelsDialogOpen}
        setOpen={setDownloadLabelsDialogOpen}
      />
      <DownloadModelDialog
        open={downloadModelDialogOpen}
        setOpen={setDownloadModelDialogOpen}
        modelVersion={modelVersion}
        modelVersionSuffix={modelVersionSuffix}
      />
      <Box
        style={{
          backgroundColor: "#161616",
          width: drawerWidth,
          height: "100vh",
        }}
      >
        <ReactCanvasConfetti
          refConfetti={getInstance}
          className={classes.confetti_canvas}
        />
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              color: "#fff",
              background: "transparent",
            },
          }}
          variant="permanent"
          // open={open}
          anchor="left"
        >
          <DrawerHeader>
            <h2 className={classes.sleuth_title}>
              <img
                src={sleuth_logo}
                className={classes.sleuthlogo}
                alt="Sleuth Logo"
              />
              <img
                id="workspace-tutorial-image"
                onClick={open_introSlides}
                src={info_icon}
                className={classes.moreinfo}
                alt="Open Tutorial"
              />
            </h2>
            {authenticationEnabled ? (
              <Tooltip title={LOGOUT_TOOLTIP_MSG} placement="right">
                <img
                  onClick={logout}
                  className={classes.logout}
                  src={logout_icon}
                />
              </Tooltip>
            ) : null}
          </DrawerHeader>

          <p className={classes.sleuth_desc}>{LABEL_SLEUTH_SHORT_DESC}</p>

          <Divider />

          <DrawerHeader
            style={{ padding: "12px 16px", alignItems: "flex-end" }}
          >
            <div className={classes.account_info}>
              {authenticationEnabled ? (
                <div>
                  <label>User ID</label>
                  <p>
                    <b>{localStorage.username}</b>
                  </p>
                </div>
              ) : null}
              <label>Workspace</label>
              <p>
                <b>{workspaceId}</b>
              </p>
            </div>
            <Tooltip
              title={GO_TO_WORKSPACE_CONFIG_TOOLTIP_MSG}
              placement="right"
            >
              <img
                onClick={() => {
                  navigate(WORKSPACE_CONFIG_PATH);
                }}
                className={classes.workspace_nav}
                src={workspace_icon}
                alt="Change to Another Workspace"
                style={{ marginBottom: "10px" }}
              />
            </Tooltip>
          </DrawerHeader>

          <Divider />
          {curCategory !== null ? (
            <Stack style={{ paddingTop: "12px", paddingBottom: "24px" }}>
              <Box sx={{ width: "100%", padding: theme.spacing(0, 2) }}>
                <Box sx={{ borderBottom: 1, borderColor: "#393939" }}>
                  <Tabs
                    className={classes.tabroot}
                    value={tabValue}
                    onChange={handleChange}
                    aria-label="workspace toggle tab"
                    variant="fullWidth"
                  >
                    <Tab
                      label="Workspace"
                      {...a11yProps(0)}
                      className={classes.tabs}
                    />
                    <Tab
                      label="Document"
                      {...a11yProps(1)}
                      className={classes.tabs}
                    />
                  </Tabs>
                </Box>
                <TabPanel
                  className={classes.entries_tab}
                  value={tabValue}
                  index={0}
                >
                  <Stack spacing={0}>
                    <label style={{ fontSize: "12px", opacity: 0.5 }}>
                      Labeled for entire workspace:
                    </label>
                    <StatsContainer>
                      <Typography>
                        <strong>Positive</strong>
                      </Typography>
                      <Typography
                        sx={{
                          color: workspace_stats.pos > 0 ? "#8ccad9" : "#fff",
                        }}
                      >
                        <strong>{workspace_stats.pos}</strong>
                      </Typography>
                    </StatsContainer>
                    <StatsContainer>
                      <Typography>
                        <strong>Negative</strong>
                      </Typography>
                      <Typography
                        sx={{
                          color: workspace_stats.neg > 0 ? "#ff758f" : "#fff",
                        }}
                      >
                        <strong>{workspace_stats.neg}</strong>
                      </Typography>
                    </StatsContainer>
                    <StatsContainer>
                      <Typography>
                        <strong>Total</strong>
                      </Typography>
                      <Typography>
                        <strong>
                          {workspace_stats.pos + workspace_stats.neg}
                        </strong>
                      </Typography>
                    </StatsContainer>
                  </Stack>
                </TabPanel>
                <TabPanel
                  className={classes.entries_tab}
                  value={tabValue}
                  index={1}
                >
                  <Stack spacing={0}>
                    <label style={{ fontSize: "12px", opacity: 0.5 }}>
                      Labeled for Current Doc:
                    </label>
                    <StatsContainer>
                      <Typography>
                        <strong>Positive</strong>
                      </Typography>
                      <Typography
                        sx={{ color: doc_stats.pos > 0 ? "#8ccad9" : "#fff" }}
                      >
                        <strong>{doc_stats.pos}</strong>
                      </Typography>
                    </StatsContainer>
                    <StatsContainer>
                      <Typography>
                        <strong>Negative</strong>
                      </Typography>
                      <Typography
                        sx={{ color: doc_stats.neg > 0 ? "#ff758f" : "#fff" }}
                      >
                        <strong>{doc_stats.neg}</strong>
                      </Typography>
                    </StatsContainer>
                    <StatsContainer>
                      <Typography>
                        <strong>Total</strong>
                      </Typography>
                      <Typography>
                        <strong>{doc_stats.pos + doc_stats.neg}</strong>
                      </Typography>
                    </StatsContainer>
                  </Stack>
                </TabPanel>
              </Box>
              <Divider />
              <Stack
                direction="row"
                alignItems="flex-end"
                sx={{
                  paddingLeft: 2,
                  paddingRight: 0,
                  paddingBottom: 1.5,
                  paddingTop: 4,
                }}
              >
                {modelVersion && modelVersion > -1 ? (
                  <Typography
                    id="model-version"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {"Current model: "}
                    <strong>
                      {modelVersion}
                      <sup>{modelVersionSuffix}</sup> version
                    </strong>
                  </Typography>
                ) : (
                  <Typography id="model-version-unavailable">
                    {"Current model: "}
                    <strong>{NO_MODEL_AVAILABLE_MSG}</strong>
                  </Typography>
                )}
                {modelVersion && modelVersion > -1 ? (
                  <Tooltip title={"Download model"} placement="top">
                    <Button
                      onClick={() => setDownloadModelDialogOpen(true)}
                      startIcon={<FileDownloadOutlinedIcon />}
                      sx={{
                        textTransform: "none",
                        padding: "0 0 0 20px",
                      }}
                    />
                  </Tooltip>
                ) : null}
              </Stack>
              <LinearWithValueLabel />
              {nextModelShouldBeTraining ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-end",
                  }}
                >
                  <div className={classes.modelStatus}>
                    {NEXT_MODEL_TRAINING_MSG}
                  </div>
                  <div className={classes["dot-pulse"]}></div>
                </div>
              ) : null}
            </Stack>
          ) : null}
          <Divider />
          <Stack
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              padding: theme.spacing("24px", 2),
            }}
          >
            <Typography>Workspace labeled data:</Typography>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
              }}
            >
              <Button
                onClick={() => setDownloadLabelsDialogOpen(true)}
                startIcon={<FileDownloadOutlinedIcon />}
                sx={{ textTransform: "none" }}
              >
                Download
              </Button>
            </Stack>
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
              }}
            >
              <Button
                startIcon={<FileUploadOutlinedIcon />}
                component="label"
                onClick={() => setUploadLabelsDialogOpen(true)}
                sx={{ textTransform: "none" }}
              >
                Upload
              </Button>
            </Stack>
          </Stack>
          <Link
            className={classes["link-to-website"]}
            href="https://ibm.biz/label-sleuth"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit the website
          </Link>
        </Drawer>
      </Box>
    </>
  );
};

export default WorkspaceInfo;
