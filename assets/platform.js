const { createApp, ref, onMounted, computed, reactive } = Vue;

document.addEventListener("DOMContentLoaded", () => {
  const appRoot = document.querySelector("[data-platform]");
  if (!appRoot) return;

  const initialPlatform = appRoot.getAttribute("data-platform") || "tieba";

  createApp({
    setup() {
      const currentPlatform = ref(initialPlatform);
      const searchQuery = ref("");
      const rawData = ref({});
      const loading = ref(true); // 是否在加载
      const errorMsg = ref(""); // 错误信息（如果有）
      const preview = reactive({ visible: false, url: "", desc: "", id: "" });

      const loadData = async () => {
        loading.value = true;
        errorMsg.value = "";
        try {
          const res = await fetch(
            `./data/${currentPlatform.value}.json` /*, {
            cache: "no-cache",
          }*/,
          );
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          rawData.value = await res.json();
        } catch (err) {
          console.error(err);
          rawData.value = {};
          errorMsg.value = "资源加载失败，请稍后重试或检查网络。";
        }
        loading.value = false;
      };

      const stats = computed(() => {
        const vals = Object.values(rawData.value || {});
        return {
          total: vals.length,
          hasResource: vals.filter((v) => v.url).length,
        };
      });

      const filteredFaces = computed(() => {
        const q = searchQuery.value.toLowerCase().trim();
        if (!q) return rawData.value;

        return Object.fromEntries(
          Object.entries(rawData.value).filter(
            ([id, info]) =>
              id.toLowerCase().includes(q) ||
              (info.desc && info.desc.toLowerCase().includes(q)),
          ),
        );
      });

      const openPreview = (info, id) => {
        if (!info.url) return;
        preview.url = info.url;
        preview.desc = info.desc;
        preview.id = id;
        preview.visible = true;
      };

      const closePreview = () => {
        preview.visible = false;
      };

      const copy = (text, type) => {
        if (!text) return;
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        alert(type + " 已复制");
      };

      onMounted(loadData);

      return {
        currentPlatform,
        searchQuery,
        filteredFaces,
        loading,
        errorMsg,
        stats,
        preview,
        openPreview,
        closePreview,
        copy,
      };
    },
  }).mount("#app");
});
