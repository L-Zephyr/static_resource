#!/usr/bin/python

import lldb
import re

def __lldb_init_module(debugger, internal_dict):
  debugger.HandleCommand('command script add -f lldb_commands.traceclass traceclass')

# ------------------
# 1. [traceclass]: Print all method calls in the specified class.
# ------------------

def traceclass_action(frame, location, dict):
  print(frame.GetFunctionName())
  frame.GetThread().GetProcess().Continue()

def traceclass(debugger, command, result, internal_dict):
  if not command:
    print("Error: class not specify")
    return

  res = lldb.SBCommandReturnObject()

  # get original breakpoint list
  debugger.GetCommandInterpreter().HandleCommand("br list", res)
  origBrList = res.GetOutput()

  # set breakpoint
  debugger.GetCommandInterpreter().HandleCommand("br set -r \[" + command + " .*\]", res)

  # get the breakpoint list
  debugger.GetCommandInterpreter().HandleCommand("br list", res) 
  if origBrList == res.GetOutput(): # nothing change means failure
    print("Error: fail to set breakpoint!")
    return

  # get the number of br we just set
  breakpoint = re.compile(r"^\d+", re.M).findall(res.GetOutput()).pop()
    
  if not breakpoint:
    print("Error: fail to set breakpoint!")
    return

  # add break point action
  debugger.GetCommandInterpreter().HandleCommand("br command add " + breakpoint + " -F lldb_commands.traceclass_action", res)
