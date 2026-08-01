import { useEffect, useState } from "react";

export function useTelegram() {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp && webApp.initData) {
      setTg(webApp);
      setIsTelegram(true);

      // Expand to full viewport height (Hamster Kombat bottom sheet effect)
      try {
        webApp.expand();
        webApp.ready();
        
        // Enable closing confirmation if supported
        if (webApp.enableClosingConfirmation) {
          webApp.enableClosingConfirmation();
        }
      } catch (e) {
        console.warn("Telegram WebApp expand failed:", e);
      }

      const tgUser = webApp.initDataUnsafe?.user;
      if (tgUser) {
        setUser({
          id: tgUser.id,
          first_name: tgUser.first_name || "",
          last_name: tgUser.last_name || "",
          username: tgUser.username || `tg_${tgUser.id}`,
          language_code: tgUser.language_code || "uz",
          photo_url: tgUser.photo_url || ""
        });
      }
    }
  }, []);

  const onClose = () => {
    tg?.close();
  };

  const showMainButton = (text, onClick) => {
    if (tg?.MainButton) {
      tg.MainButton.setText(text);
      tg.MainButton.show();
      tg.MainButton.onClick(onClick);
    }
  };

  const hideMainButton = () => {
    tg?.MainButton?.hide();
  };

  return {
    tg,
    user,
    isTelegram,
    initData: tg?.initData || "",
    onClose,
    showMainButton,
    hideMainButton,
    themeParams: tg?.themeParams || {}
  };
}
