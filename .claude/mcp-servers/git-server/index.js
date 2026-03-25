#!/usr/bin/env node

/**
 * Git MCP Server - Project Level
 * Provides git operations as MCP tools for Claude Code
 */

const { execSync } = require("child_process");
const path = require("path");
const readline = require("readline");

// Project root is 3 levels up from this file (.claude/mcp-servers/git-server/)
const PROJECT_ROOT = path.resolve(__dirname, "../../..");

function runGit(args, options = {}) {
  try {
    const result = execSync(`git ${args}`, {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      ...options,
    });
    return { success: true, output: result.trim() };
  } catch (err) {
    return {
      success: false,
      output: err.stderr ? err.stderr.trim() : err.message,
    };
  }
}

const TOOLS = [
  {
    name: "git_status",
    description: "Show the working tree status",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "git_log",
    description: "Show recent commit history",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of commits to show (default: 10)",
        },
        oneline: {
          type: "boolean",
          description: "Show each commit on one line",
        },
        branch: {
          type: "string",
          description: "Branch name to show log for (default: current branch)",
        },
      },
      required: [],
    },
  },
  {
    name: "git_diff",
    description: "Show changes between commits, commit and working tree, etc.",
    inputSchema: {
      type: "object",
      properties: {
        staged: {
          type: "boolean",
          description: "Show staged changes (git diff --staged)",
        },
        file: {
          type: "string",
          description: "Specific file path to diff",
        },
        from_ref: {
          type: "string",
          description: "Source ref/commit for comparison",
        },
        to_ref: {
          type: "string",
          description: "Target ref/commit for comparison",
        },
      },
      required: [],
    },
  },
  {
    name: "git_branch",
    description: "List, create, or delete branches",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["list", "create", "delete", "rename", "current"],
          description: "Action to perform",
        },
        name: {
          type: "string",
          description: "Branch name (for create/delete/rename)",
        },
        new_name: {
          type: "string",
          description: "New branch name (for rename)",
        },
        all: {
          type: "boolean",
          description: "List all branches including remote (for list action)",
        },
      },
      required: ["action"],
    },
  },
  {
    name: "git_add",
    description: "Add file contents to the index (staging area)",
    inputSchema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: { type: "string" },
          description: "List of files to stage. Use ['.'] to stage all changes.",
        },
      },
      required: ["files"],
    },
  },
  {
    name: "git_commit",
    description: "Record changes to the repository",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "Commit message",
        },
        all: {
          type: "boolean",
          description: "Automatically stage modified/deleted files before commit",
        },
      },
      required: ["message"],
    },
  },
  {
    name: "git_checkout",
    description: "Switch branches or restore working tree files",
    inputSchema: {
      type: "object",
      properties: {
        branch: {
          type: "string",
          description: "Branch name to checkout",
        },
        create: {
          type: "boolean",
          description: "Create branch if it doesn't exist (-b flag)",
        },
        file: {
          type: "string",
          description: "Restore a specific file from HEAD",
        },
      },
      required: [],
    },
  },
  {
    name: "git_pull",
    description: "Fetch from and integrate with another repository or branch",
    inputSchema: {
      type: "object",
      properties: {
        remote: {
          type: "string",
          description: "Remote name (default: origin)",
        },
        branch: {
          type: "string",
          description: "Branch name (default: current branch)",
        },
        rebase: {
          type: "boolean",
          description: "Use rebase instead of merge",
        },
      },
      required: [],
    },
  },
  {
    name: "git_push",
    description: "Update remote refs along with associated objects",
    inputSchema: {
      type: "object",
      properties: {
        remote: {
          type: "string",
          description: "Remote name (default: origin)",
        },
        branch: {
          type: "string",
          description: "Branch name (default: current branch)",
        },
        set_upstream: {
          type: "boolean",
          description: "Set upstream tracking (-u flag)",
        },
      },
      required: [],
    },
  },
  {
    name: "git_stash",
    description: "Stash the changes in a dirty working directory",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["push", "pop", "list", "drop", "apply", "show"],
          description: "Stash action to perform",
        },
        message: {
          type: "string",
          description: "Stash message (for push action)",
        },
        index: {
          type: "number",
          description: "Stash index (for drop/apply/show actions)",
        },
      },
      required: ["action"],
    },
  },
  {
    name: "git_reset",
    description: "Reset current HEAD to the specified state",
    inputSchema: {
      type: "object",
      properties: {
        mode: {
          type: "string",
          enum: ["soft", "mixed", "hard"],
          description: "Reset mode (default: mixed)",
        },
        ref: {
          type: "string",
          description: "Commit ref to reset to (default: HEAD)",
        },
        file: {
          type: "string",
          description: "Unstage a specific file (git reset HEAD <file>)",
        },
      },
      required: [],
    },
  },
  {
    name: "git_show",
    description: "Show various types of objects (commits, tags, etc.)",
    inputSchema: {
      type: "object",
      properties: {
        ref: {
          type: "string",
          description: "Commit hash, tag, or ref to show (default: HEAD)",
        },
        stat: {
          type: "boolean",
          description: "Show file statistics instead of full diff",
        },
      },
      required: [],
    },
  },
  {
    name: "git_remote",
    description: "Manage set of tracked repositories",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["list", "show", "add", "remove"],
          description: "Remote action",
        },
        name: {
          type: "string",
          description: "Remote name",
        },
        url: {
          type: "string",
          description: "Remote URL (for add action)",
        },
      },
      required: ["action"],
    },
  },
  {
    name: "git_tag",
    description: "Create, list, delete or verify a tag object",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["list", "create", "delete"],
          description: "Tag action",
        },
        name: {
          type: "string",
          description: "Tag name",
        },
        message: {
          type: "string",
          description: "Tag message (creates annotated tag)",
        },
        ref: {
          type: "string",
          description: "Commit to tag (default: HEAD)",
        },
      },
      required: ["action"],
    },
  },
];

function handleTool(name, args) {
  switch (name) {
    case "git_status": {
      const r = runGit("status");
      return r.output;
    }

    case "git_log": {
      const count = args.count || 10;
      const oneline = args.oneline ? " --oneline" : " --pretty=format:'%h %as %an: %s'";
      const branch = args.branch ? ` ${args.branch}` : "";
      const r = runGit(`log -${count}${oneline}${branch}`);
      return r.success ? r.output : `Error: ${r.output}`;
    }

    case "git_diff": {
      let cmd = "diff";
      if (args.staged) cmd += " --staged";
      if (args.from_ref && args.to_ref) cmd += ` ${args.from_ref} ${args.to_ref}`;
      else if (args.from_ref) cmd += ` ${args.from_ref}`;
      if (args.file) cmd += ` -- ${args.file}`;
      const r = runGit(cmd);
      return r.output || "(no differences)";
    }

    case "git_branch": {
      switch (args.action) {
        case "list": {
          const flag = args.all ? "-a" : "";
          const r = runGit(`branch ${flag}`);
          return r.success ? r.output : `Error: ${r.output}`;
        }
        case "current": {
          const r = runGit("branch --show-current");
          return r.success ? r.output : `Error: ${r.output}`;
        }
        case "create": {
          const r = runGit(`branch ${args.name}`);
          return r.success ? `Branch '${args.name}' created.` : `Error: ${r.output}`;
        }
        case "delete": {
          const r = runGit(`branch -d ${args.name}`);
          return r.success ? `Branch '${args.name}' deleted.` : `Error: ${r.output}`;
        }
        case "rename": {
          const r = runGit(`branch -m ${args.name} ${args.new_name}`);
          return r.success
            ? `Branch renamed to '${args.new_name}'.`
            : `Error: ${r.output}`;
        }
        default:
          return "Unknown branch action";
      }
    }

    case "git_add": {
      const files = args.files.join(" ");
      const r = runGit(`add ${files}`);
      return r.success ? `Staged: ${files}` : `Error: ${r.output}`;
    }

    case "git_commit": {
      const allFlag = args.all ? " -a" : "";
      const r = runGit(`commit${allFlag} -m "${args.message.replace(/"/g, '\\"')}"`);
      return r.success ? r.output : `Error: ${r.output}`;
    }

    case "git_checkout": {
      if (args.file) {
        const r = runGit(`checkout -- ${args.file}`);
        return r.success ? `Restored: ${args.file}` : `Error: ${r.output}`;
      }
      const createFlag = args.create ? " -b" : "";
      const branch = args.branch || "main";
      const r = runGit(`checkout${createFlag} ${branch}`);
      return r.success ? r.output || `Switched to branch '${branch}'` : `Error: ${r.output}`;
    }

    case "git_pull": {
      const remote = args.remote || "origin";
      const branch = args.branch || "";
      const rebaseFlag = args.rebase ? " --rebase" : "";
      const r = runGit(`pull${rebaseFlag} ${remote} ${branch}`.trim());
      return r.success ? r.output : `Error: ${r.output}`;
    }

    case "git_push": {
      const remote = args.remote || "origin";
      const branch = args.branch || "";
      const upstreamFlag = args.set_upstream ? " -u" : "";
      const r = runGit(`push${upstreamFlag} ${remote} ${branch}`.trim());
      return r.success ? r.output || "Push successful." : `Error: ${r.output}`;
    }

    case "git_stash": {
      switch (args.action) {
        case "push": {
          const msg = args.message ? ` -m "${args.message}"` : "";
          const r = runGit(`stash push${msg}`);
          return r.success ? r.output : `Error: ${r.output}`;
        }
        case "pop": {
          const r = runGit("stash pop");
          return r.success ? r.output : `Error: ${r.output}`;
        }
        case "list": {
          const r = runGit("stash list");
          return r.success ? r.output || "(no stashes)" : `Error: ${r.output}`;
        }
        case "drop": {
          const idx = args.index !== undefined ? ` stash@{${args.index}}` : "";
          const r = runGit(`stash drop${idx}`);
          return r.success ? r.output : `Error: ${r.output}`;
        }
        case "apply": {
          const idx = args.index !== undefined ? ` stash@{${args.index}}` : "";
          const r = runGit(`stash apply${idx}`);
          return r.success ? r.output : `Error: ${r.output}`;
        }
        case "show": {
          const idx = args.index !== undefined ? ` stash@{${args.index}}` : "";
          const r = runGit(`stash show${idx}`);
          return r.success ? r.output : `Error: ${r.output}`;
        }
        default:
          return "Unknown stash action";
      }
    }

    case "git_reset": {
      if (args.file) {
        const r = runGit(`reset HEAD ${args.file}`);
        return r.success ? `Unstaged: ${args.file}` : `Error: ${r.output}`;
      }
      const mode = args.mode ? ` --${args.mode}` : "";
      const ref = args.ref || "HEAD";
      const r = runGit(`reset${mode} ${ref}`);
      return r.success ? r.output || "Reset complete." : `Error: ${r.output}`;
    }

    case "git_show": {
      const ref = args.ref || "HEAD";
      const stat = args.stat ? " --stat" : "";
      const r = runGit(`show${stat} ${ref}`);
      return r.success ? r.output : `Error: ${r.output}`;
    }

    case "git_remote": {
      switch (args.action) {
        case "list": {
          const r = runGit("remote -v");
          return r.success ? r.output || "(no remotes)" : `Error: ${r.output}`;
        }
        case "show": {
          const r = runGit(`remote show ${args.name || "origin"}`);
          return r.success ? r.output : `Error: ${r.output}`;
        }
        case "add": {
          const r = runGit(`remote add ${args.name} ${args.url}`);
          return r.success ? `Remote '${args.name}' added.` : `Error: ${r.output}`;
        }
        case "remove": {
          const r = runGit(`remote remove ${args.name}`);
          return r.success ? `Remote '${args.name}' removed.` : `Error: ${r.output}`;
        }
        default:
          return "Unknown remote action";
      }
    }

    case "git_tag": {
      switch (args.action) {
        case "list": {
          const r = runGit("tag -l");
          return r.success ? r.output || "(no tags)" : `Error: ${r.output}`;
        }
        case "create": {
          const msg = args.message ? ` -a -m "${args.message}"` : "";
          const ref = args.ref ? ` ${args.ref}` : "";
          const r = runGit(`tag${msg} ${args.name}${ref}`);
          return r.success ? `Tag '${args.name}' created.` : `Error: ${r.output}`;
        }
        case "delete": {
          const r = runGit(`tag -d ${args.name}`);
          return r.success ? `Tag '${args.name}' deleted.` : `Error: ${r.output}`;
        }
        default:
          return "Unknown tag action";
      }
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

// MCP JSON-RPC over stdio
const rl = readline.createInterface({ input: process.stdin });

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

rl.on("line", (line) => {
  let request;
  try {
    request = JSON.parse(line);
  } catch {
    return;
  }

  const { id, method, params } = request;

  if (method === "initialize") {
    send({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "git-mcp-server", version: "1.0.0" },
      },
    });
  } else if (method === "tools/list") {
    send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
  } else if (method === "tools/call") {
    const { name, arguments: args } = params;
    try {
      const output = handleTool(name, args || {});
      send({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: String(output) }],
        },
      });
    } catch (err) {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          content: [{ type: "text", text: `Error: ${err.message}` }],
          isError: true,
        },
      });
    }
  } else if (method === "notifications/initialized") {
    // no response needed
  } else {
    send({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  }
});
