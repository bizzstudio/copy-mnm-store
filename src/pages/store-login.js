import { getStoreLoginEntryUrl, getTokenFromUserInfoCookieValue, isStoreLoginRequired } from "@utils/storeAccess";

/**
 * תאימות לקישורים ישנים: תמיד מפנה לדף הבית + מודאל התחברות.
 */
export async function getServerSideProps(context) {
  const redir = context.query.redirect;

  if (isStoreLoginRequired()) {
    const raw = context.req.cookies?.userInfo;
    if (getTokenFromUserInfoCookieValue(raw || "")) {
      const destination =
        typeof redir === "string" && redir.startsWith("/") ? redir : "/";
      return { redirect: { destination, permanent: false } };
    }
  }

  const destination =
    typeof redir === "string" && redir.startsWith("/")
      ? getStoreLoginEntryUrl(redir)
      : getStoreLoginEntryUrl();

  return { redirect: { destination, permanent: false } };
}

export default function LegacyStoreLoginRedirect() {
  return null;
}
