import store from "../stores";
import type {RootState, AppDispatch} from "../stores";
import {useDispatch as _useDispatch } from "react-redux";

export const useDispatch = (): AppDispatch => _useDispatch()
