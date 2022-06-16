import * as React from 'react';
import { useCallback, useRef } from "react";
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import CreateCategoryModal from './upperbar/Modal';
import { ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchElements,
  getElementToLabel,
  checkStatus,
  fetchCategories,
  getPositiveElementForCategory,
  checkModelUpdate,
  fetchDocuments,
  setFocusedState,
  setIsDocLoaded,
  setIsCategoryLoaded,
  setNumLabelGlobal,
} from './DataSlice.jsx';
import WorkspaceInfo from './information/WorkspaceInfo';
import Sidebar from './sidebar/index';
import UpperBar from './upperbar/UpperBar';
import MainContent from './main/MainContent'
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

export default function Workspace() {
  const workspaceId = JSON.parse(window.localStorage.getItem('workspaceId'))
  const [open, setOpen] = React.useState(false);
  const workspace = useSelector(state => state.workspace)
  const [modalOpen, setModalOpen] = React.useState(false)
  const isCategoryLoaded = useSelector(state => state.workspace.isCategoryLoaded)
  const isDocLoaded = useSelector(state => state.workspace.isDocLoaded)
  const [openBackdrop, setOpenBackdrop] = React.useState(false);
  
  const handleKeyEvent = (event, len_elements) => {

    console.log("key pressed")
    if (event.key === "ArrowDown") {
      if (workspace.focusedIndex < len_elements) {
        dispatch(setFocusedState(workspace.focusedIndex + 1))
      }
    } else if (event.key === "ArrowUp") {
      if (workspace.focusedIndex > 0) {
        dispatch(setFocusedState(workspace.focusedIndex - 1))
      }
    }
  }

  const handleClick = (event, id) => {
    if (event.detail == 1) {
      dispatch(setFocusedState(id))
    }
  }

  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(setIsCategoryLoaded(false));
    dispatch(setIsDocLoaded(false));
    dispatch(checkModelUpdate());
    dispatch(fetchDocuments()).then(() =>
      dispatch(fetchElements()).then(() =>
        dispatch(fetchCategories()).then(() => {
          if (workspace.curCategory) {
            dispatch(checkStatus());
            dispatch(getElementToLabel());
          }
          dispatch(setIsCategoryLoaded(true));
          dispatch(setIsDocLoaded(true));
        })
      )
    );

    const interval = setInterval(() => {
      console.log(`curCategory value: ${workspace.curCategory}`)
      if (workspace.curCategory != null) {
        dispatch(checkModelUpdate()).then(() => {
        })
      } else {

      }
    }, 5000);
    return () => clearInterval(interval);
  }, [workspace.curCategory])

  React.useEffect(() => {
    setNumLabelGlobal({ pos: workspace.pos_label_num, neg: workspace.neg_label_num })
  }, [workspace.pos_label_num])

  React.useEffect(()=>{
    if(!workspace.curDocName || (!isCategoryLoaded ) || !isDocLoaded){
      setOpenBackdrop(!openBackdrop)
    }
    else{
     {setOpenBackdrop(false)}
    }
 
   },[workspace.curDocName, isCategoryLoaded, workspace.curCategory, !isDocLoaded])


  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <ToastContainer position="top-center" hideProgressBar={true} autoClose={2000} theme='dark' />
        <WorkspaceInfo workspaceId={workspaceId} />
        <Box component="main" sx={{ padding: 0 }}>
          <UpperBar setModalOpen={setModalOpen} open={open} />
          <Sidebar open={open} setOpen={setOpen} />
          <MainContent handleKeyEvent={handleKeyEvent} handleClick={handleClick} open={open} />
        </Box>
        <CreateCategoryModal open={modalOpen} setOpen={setModalOpen} />
      </Box>
      <Backdrop
        sx={{ color: '#fff', zIndex: 10000 }}
        open={openBackdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

