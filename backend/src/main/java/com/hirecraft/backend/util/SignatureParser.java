package com.hirecraft.backend.util;

import java.util.*;

public class SignatureParser {

    public static class ParamInfo {
        public String name;
        public String javaType;
        public String cppType;
        public String pythonType;

        public ParamInfo(String name, String javaType, String cppType, String pythonType) {
            this.name = name;
            this.javaType = javaType;
            this.cppType = cppType;
            this.pythonType = pythonType;
        }
    }

    public static class SignatureInfo {
        public String returnJava;
        public String returnCpp;
        public String returnPython;
        public String defaultReturnJava;
        public String defaultReturnCpp;
        public List<ParamInfo> params = new ArrayList<>();
    }

    public static SignatureInfo parse(Question q) {
        SignatureInfo info = new SignatureInfo();
        
        // Default fallbacks
        info.returnJava = "void";
        info.returnCpp = "void";
        info.returnPython = "None";
        info.defaultReturnJava = "";
        info.defaultReturnCpp = "";

        if (q.getExamples() == null || q.getExamples().isEmpty()) {
            return info;
        }

        Question.Example ex = q.getExamples().get(0);
        if (ex.getInput() != null) {
            info.params = parseParams(ex.getInput());
        }
        
        if (ex.getOutput() != null) {
            String outStr = ex.getOutput().trim();
            TypeInference outType = inferType(outStr);
            info.returnJava = outType.javaType;
            info.returnCpp = outType.cppType;
            info.returnPython = outType.pythonType;
            info.defaultReturnJava = outType.javaDefault;
            info.defaultReturnCpp = outType.cppDefault;
            
            // Link list heuristic
            if (isLinkedListQuestion(q) && outType.javaType.equals("int[]")) {
                info.returnJava = "ListNode";
                info.returnCpp = "ListNode*";
                info.defaultReturnJava = "return null;";
                info.defaultReturnCpp = "return nullptr;";
            }
            // Tree heuristic
            else if (isTreeQuestion(q) && outType.javaType.equals("int[]")) {
                info.returnJava = "TreeNode";
                info.returnCpp = "TreeNode*";
                info.defaultReturnJava = "return null;";
                info.defaultReturnCpp = "return nullptr;";
            }
        }

        return info;
    }

    private static List<ParamInfo> parseParams(String inputStr) {
        List<ParamInfo> params = new ArrayList<>();
        // Split by ", " but ignore commas inside brackets or quotes
        // Naive split for now: just split by ", "
        String[] parts = inputStr.split(", (?![^\\[]*\\]|[^\"]*\")");
        for (String p : parts) {
            String[] kv = p.split("=", 2);
            if (kv.length == 2) {
                String name = kv[0].trim();
                String val = kv[1].trim();
                TypeInference t = inferType(val);
                params.add(new ParamInfo(name, t.javaType, t.cppType, t.pythonType));
            } else if (kv.length == 1) {
                // E.g., just "123" without name
                String val = kv[0].trim();
                TypeInference t = inferType(val);
                params.add(new ParamInfo("param" + (params.size() + 1), t.javaType, t.cppType, t.pythonType));
            }
        }
        return params;
    }

    private static class TypeInference {
        String javaType;
        String cppType;
        String pythonType;
        String javaDefault;
        String cppDefault;
        
        TypeInference(String j, String c, String p, String jd, String cd) {
            this.javaType = j;
            this.cppType = c;
            this.pythonType = p;
            this.javaDefault = jd;
            this.cppDefault = cd;
        }
    }

    private static TypeInference inferType(String val) {
        if (val.startsWith("\"") && val.endsWith("\"")) {
            return new TypeInference("String", "string", "str", "return \"\";", "return \"\";");
        }
        if (val.equalsIgnoreCase("true") || val.equalsIgnoreCase("false")) {
            return new TypeInference("boolean", "bool", "bool", "return false;", "return false;");
        }
        if (val.startsWith("[[") && val.endsWith("]]")) {
            return new TypeInference("int[][]", "vector<vector<int>>", "List[List[int]]", "return new int[][]{};", "return {};");
        }
        if (val.startsWith("[\"") && val.endsWith("\"]")) {
            return new TypeInference("String[]", "vector<string>", "List[str]", "return new String[]{};", "return {};");
        }
        if (val.startsWith("[") && val.endsWith("]")) {
            return new TypeInference("int[]", "vector<int>", "List[int]", "return new int[]{};", "return {};");
        }
        if (val.contains(".")) {
            try {
                Double.parseDouble(val);
                return new TypeInference("double", "double", "float", "return 0.0;", "return 0.0;");
            } catch (Exception ignored) {}
        }
        try {
            Integer.parseInt(val);
            return new TypeInference("int", "int", "int", "return 0;", "return 0;");
        } catch (Exception ignored) {}
        
        // Fallback
        return new TypeInference("int", "int", "int", "return 0;", "return 0;");
    }

    private static boolean isLinkedListQuestion(Question q) {
        if (q.getDescription() == null) return false;
        String desc = q.getDescription().toLowerCase();
        return desc.contains("linked list") || desc.contains("listnode");
    }
    
    private static boolean isTreeQuestion(Question q) {
        if (q.getDescription() == null) return false;
        String desc = q.getDescription().toLowerCase();
        return desc.contains("binary tree") || desc.contains("treenode");
    }
}
