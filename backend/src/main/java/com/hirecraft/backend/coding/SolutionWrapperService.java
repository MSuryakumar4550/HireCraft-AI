package com.hirecraft.backend.coding;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SolutionWrapperService {

    public String wrap(String userCode, String language, Integer questionId, String tcInput) {
        if (questionId == null || userCode == null || language == null || tcInput == null) return userCode;

        switch (questionId) {
            case 1: return wrapQuestion1(userCode, language, tcInput);
            case 9: return wrapQuestion9(userCode, language, tcInput);
            case 20: return wrapQuestion20(userCode, language, tcInput);
            case 58: return wrapQuestion58(userCode, language, tcInput);
            case 136: return wrapQuestion136(userCode, language, tcInput);
            case 3: return wrapQuestion3(userCode, language, tcInput);
            case 11: return wrapQuestion11(userCode, language, tcInput);
            case 33: return wrapQuestion33(userCode, language, tcInput);
            case 153: return wrapQuestion153(userCode, language, tcInput);
            case 167: return wrapQuestion167(userCode, language, tcInput);
            case 4: return wrapQuestion4(userCode, language, tcInput);
            case 41: return wrapQuestion41(userCode, language, tcInput);
            case 42: return wrapQuestion42(userCode, language, tcInput);
            case 84: return wrapQuestion84(userCode, language, tcInput);
            case 410: return wrapQuestion410(userCode, language, tcInput);
            case 70: return wrapQuestion70(userCode, language, tcInput);
            case 53: return wrapQuestion53(userCode, language, tcInput);
            case 239: return wrapQuestion239(userCode, language, tcInput);
            default:
                log.debug("No wrapper defined for questionId={}, submitting user code as-is", questionId);
                return userCode;
        }
    }

    private String wrapQuestion1(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\n", 2);
        if(lines.length < 2) return userCode;
        String nums = lines[0].trim();
        String target = lines[1].trim();
        String javaNums = "new int[] {" + nums.replaceAll("^\\[", "").replaceAll("\\]$", "") + "}";
        String cppNums = "{" + nums.replaceAll("^\\[", "").replaceAll("\\]$", "") + "}";
        
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nnums = " + nums + "\ntarget = " + target + "\nprint(list(Solution().twoSum(nums, target)))\n";
            case "java" -> "import java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] nums = " + javaNums + ";\n        int target = " + target + ";\n        System.out.println(Arrays.toString(sol.twoSum(nums, target)));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    vector<int> nums = " + cppNums + ";\n    int target = " + target + ";\n    vector<int> res = sol.twoSum(nums, target);\n    cout << \"[\";\n    for(int i=0; i<(int)res.size(); i++) {\n        if(i>0) cout << \", \";\n        cout << res[i];\n    }\n    cout << \"]\" << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion9(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 1);
        if (lines.length < 1) return userCode;
        String x_raw = lines[0].trim();
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nx = " + x_raw + "\nprint(str(Solution().isPalindrome(x)).lower())\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int x = " + x_raw + ";\n        System.out.println(new Solution().isPalindrome(x));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    int x = " + x_raw + ";\n    cout << (sol.isPalindrome(x) ? \"true\" : \"false\") << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion20(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 1);
        if (lines.length < 1) return userCode;
        String s_raw = lines[0].trim();
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\ns = " + s_raw + "\nprint(str(Solution().isValid(s)).lower())\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        String s = " + s_raw + ";\n        System.out.println(new Solution().isValid(s));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    string s = " + s_raw + ";\n    cout << (sol.isValid(s) ? \"true\" : \"false\") << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion58(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 1);
        if (lines.length < 1) return userCode;
        String s_raw = lines[0].trim();
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\ns = " + s_raw + "\nprint(Solution().lengthOfLastWord(s))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        String s = " + s_raw + ";\n        System.out.println(new Solution().lengthOfLastWord(s));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    string s = " + s_raw + ";\n    cout << sol.lengthOfLastWord(s) << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion136(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 1);
        if (lines.length < 1) return userCode;
        String nums_raw = lines[0].trim();
        String nums_inner = nums_raw.replaceAll("^\\\\[", "").replaceAll("\\\\]$", "");
        String nums_java = "new int[] {";
        nums_java += nums_inner + "}";
        String nums_cpp = "{";
        nums_cpp += nums_inner + "}";
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nnums = " + nums_raw + "\nprint(Solution().singleNumber(nums))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] nums = " + nums_java + ";\n        System.out.println(new Solution().singleNumber(nums));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    vector<int> nums = " + nums_cpp + ";\n    cout << sol.singleNumber(nums) << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion3(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 1);
        if (lines.length < 1) return userCode;
        String s_raw = lines[0].trim();
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\ns = " + s_raw + "\nprint(Solution().lengthOfLongestSubstring(s))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        String s = " + s_raw + ";\n        System.out.println(new Solution().lengthOfLongestSubstring(s));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    string s = " + s_raw + ";\n    cout << sol.lengthOfLongestSubstring(s) << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion11(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 1);
        if (lines.length < 1) return userCode;
        String height_raw = lines[0].trim();
        String height_inner = height_raw.replaceAll("^\\\\[", "").replaceAll("\\\\]$", "");
        String height_java = "new int[] {";
        height_java += height_inner + "}";
        String height_cpp = "{";
        height_cpp += height_inner + "}";
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nheight = " + height_raw + "\nprint(Solution().maxArea(height))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] height = " + height_java + ";\n        System.out.println(new Solution().maxArea(height));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    vector<int> height = " + height_cpp + ";\n    cout << sol.maxArea(height) << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion33(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 2);
        if (lines.length < 2) return userCode;
        String nums_raw = lines[0].trim();
        String nums_inner = nums_raw.replaceAll("^\\\\[", "").replaceAll("\\\\]$", "");
        String nums_java = "new int[] {";
        nums_java += nums_inner + "}";
        String nums_cpp = "{";
        nums_cpp += nums_inner + "}";
        String target_raw = lines[1].trim();
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nnums = " + nums_raw + "\ntarget = " + target_raw + "\nprint(Solution().search(nums, target))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] nums = " + nums_java + ";\n        int target = " + target_raw + ";\n        System.out.println(new Solution().search(nums, target));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    vector<int> nums = " + nums_cpp + ";\n    int target = " + target_raw + ";\n    cout << sol.search(nums, target) << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion153(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 1);
        if (lines.length < 1) return userCode;
        String nums_raw = lines[0].trim();
        String nums_inner = nums_raw.replaceAll("^\\\\[", "").replaceAll("\\\\]$", "");
        String nums_java = "new int[] {";
        nums_java += nums_inner + "}";
        String nums_cpp = "{";
        nums_cpp += nums_inner + "}";
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nnums = " + nums_raw + "\nprint(Solution().findMin(nums))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] nums = " + nums_java + ";\n        System.out.println(new Solution().findMin(nums));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    vector<int> nums = " + nums_cpp + ";\n    cout << sol.findMin(nums) << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion167(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 2);
        if (lines.length < 2) return userCode;
        String numbers_raw = lines[0].trim();
        String numbers_inner = numbers_raw.replaceAll("^\\\\[", "").replaceAll("\\\\]$", "");
        String numbers_java = "new int[] {";
        numbers_java += numbers_inner + "}";
        String numbers_cpp = "{";
        numbers_cpp += numbers_inner + "}";
        String target_raw = lines[1].trim();
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nnumbers = " + numbers_raw + "\ntarget = " + target_raw + "\nprint(list(Solution().twoSum(numbers, target)))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] numbers = " + numbers_java + ";\n        int target = " + target_raw + ";\n        System.out.println(Arrays.toString(new Solution().twoSum(numbers, target)));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    vector<int> numbers = " + numbers_cpp + ";\n    int target = " + target_raw + ";\n    vector<int> res = sol.twoSum(numbers, target);\n    cout << \"[\";\n    for(int i=0; i<(int)res.size(); i++) {\n    if(i>0) cout << \", \";\n    cout << res[i];\n    }\n    cout << \"]\" << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion4(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 2);
        if (lines.length < 2) return userCode;
        String nums1_raw = lines[0].trim();
        String nums1_inner = nums1_raw.replaceAll("^\\\\[", "").replaceAll("\\\\]$", "");
        String nums1_java = "new int[] {";
        nums1_java += nums1_inner + "}";
        String nums1_cpp = "{";
        nums1_cpp += nums1_inner + "}";
        String nums2_raw = lines[1].trim();
        String nums2_inner = nums2_raw.replaceAll("^\\\\[", "").replaceAll("\\\\]$", "");
        String nums2_java = "new int[] {";
        nums2_java += nums2_inner + "}";
        String nums2_cpp = "{";
        nums2_cpp += nums2_inner + "}";
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nnums1 = " + nums1_raw + "\nnums2 = " + nums2_raw + "\nprint(Solution().findMedianSortedArrays(nums1, nums2))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] nums1 = " + nums1_java + ";\n        int[] nums2 = " + nums2_java + ";\n        System.out.printf(\"%.5f\\n\", new Solution().findMedianSortedArrays(nums1, nums2));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    vector<int> nums1 = " + nums1_cpp + ";\n    vector<int> nums2 = " + nums2_cpp + ";\n    cout << fixed << setprecision(5) << sol.findMedianSortedArrays(nums1, nums2) << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion41(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 1);
        if (lines.length < 1) return userCode;
        String nums_raw = lines[0].trim();
        String nums_inner = nums_raw.replaceAll("^\\\\[", "").replaceAll("\\\\]$", "");
        String nums_java = "new int[] {";
        nums_java += nums_inner + "}";
        String nums_cpp = "{";
        nums_cpp += nums_inner + "}";
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nnums = " + nums_raw + "\nprint(Solution().firstMissingPositive(nums))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] nums = " + nums_java + ";\n        System.out.println(new Solution().firstMissingPositive(nums));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    vector<int> nums = " + nums_cpp + ";\n    cout << sol.firstMissingPositive(nums) << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion42(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 1);
        if (lines.length < 1) return userCode;
        String height_raw = lines[0].trim();
        String height_inner = height_raw.replaceAll("^\\\\[", "").replaceAll("\\\\]$", "");
        String height_java = "new int[] {";
        height_java += height_inner + "}";
        String height_cpp = "{";
        height_cpp += height_inner + "}";
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nheight = " + height_raw + "\nprint(Solution().trap(height))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] height = " + height_java + ";\n        System.out.println(new Solution().trap(height));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    vector<int> height = " + height_cpp + ";\n    cout << sol.trap(height) << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion84(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 1);
        if (lines.length < 1) return userCode;
        String heights_raw = lines[0].trim();
        String heights_inner = heights_raw.replaceAll("^\\\\[", "").replaceAll("\\\\]$", "");
        String heights_java = "new int[] {";
        heights_java += heights_inner + "}";
        String heights_cpp = "{";
        heights_cpp += heights_inner + "}";
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nheights = " + heights_raw + "\nprint(Solution().largestRectangleArea(heights))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] heights = " + heights_java + ";\n        System.out.println(new Solution().largestRectangleArea(heights));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    vector<int> heights = " + heights_cpp + ";\n    cout << sol.largestRectangleArea(heights) << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion410(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 2);
        if (lines.length < 2) return userCode;
        String nums_raw = lines[0].trim();
        String nums_inner = nums_raw.replaceAll("^\\\\[", "").replaceAll("\\\\]$", "");
        String nums_java = "new int[] {";
        nums_java += nums_inner + "}";
        String nums_cpp = "{";
        nums_cpp += nums_inner + "}";
        String k_raw = lines[1].trim();
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nnums = " + nums_raw + "\nk = " + k_raw + "\nprint(Solution().splitArray(nums, k))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] nums = " + nums_java + ";\n        int k = " + k_raw + ";\n        System.out.println(new Solution().splitArray(nums, k));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    vector<int> nums = " + nums_cpp + ";\n    int k = " + k_raw + ";\n    cout << sol.splitArray(nums, k) << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion70(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 1);
        if (lines.length < 1) return userCode;
        String n_raw = lines[0].trim();
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nn = " + n_raw + "\nprint(Solution().climbStairs(n))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int n = " + n_raw + ";\n        System.out.println(new Solution().climbStairs(n));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    int n = " + n_raw + ";\n    cout << sol.climbStairs(n) << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion53(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 1);
        if (lines.length < 1) return userCode;
        String nums_raw = lines[0].trim();
        String nums_inner = nums_raw.replaceAll("^\\\\[", "").replaceAll("\\\\]$", "");
        String nums_java = "new int[] {";
        nums_java += nums_inner + "}";
        String nums_cpp = "{";
        nums_cpp += nums_inner + "}";
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nnums = " + nums_raw + "\nprint(Solution().maxSubArray(nums))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] nums = " + nums_java + ";\n        System.out.println(new Solution().maxSubArray(nums));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    vector<int> nums = " + nums_cpp + ";\n    cout << sol.maxSubArray(nums) << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }

    private String wrapQuestion239(String userCode, String language, String tcInput) {
        String[] lines = tcInput.split("\\n", 2);
        if (lines.length < 2) return userCode;
        String nums_raw = lines[0].trim();
        String nums_inner = nums_raw.replaceAll("^\\\\[", "").replaceAll("\\\\]$", "");
        String nums_java = "new int[] {";
        nums_java += nums_inner + "}";
        String nums_cpp = "{";
        nums_cpp += nums_inner + "}";
        String k_raw = lines[1].trim();
        return switch (language.toLowerCase()) {
            case "python" -> userCode + "\n\n# --- driver ---\nnums = " + nums_raw + "\nk = " + k_raw + "\nprint(list(Solution().maxSlidingWindow(nums, k)))\n";
            case "java" -> "import java.util.*;\nimport java.util.Arrays;\n\n" + userCode + "\n\npublic class Main {\n    public static void main(String[] args) {\n        Solution sol = new Solution();\n        int[] nums = " + nums_java + ";\n        int k = " + k_raw + ";\n        System.out.println(Arrays.toString(new Solution().maxSlidingWindow(nums, k)));\n    }\n}\n";
            case "cpp" -> "#include <bits/stdc++.h>\nusing namespace std;\n\n" + userCode + "\n\nint main() {\n    Solution sol;\n    vector<int> nums = " + nums_cpp + ";\n    int k = " + k_raw + ";\n    vector<int> res = sol.maxSlidingWindow(nums, k);\n    cout << \"[\";\n    for(int i=0; i<(int)res.size(); i++) {\n    if(i>0) cout << \", \";\n    cout << res[i];\n    }\n    cout << \"]\" << endl;\n    return 0;\n}\n";
            default -> userCode;
        };
    }
}
