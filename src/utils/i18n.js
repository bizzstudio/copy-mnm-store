// src/utils/i18n.js
export async function getI18nProps(context) {
    const locale = context?.locale || 'he';

    return {
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
}

// Wrapper for getStaticProps
export function withI18nStaticProps(getStaticPropsFunc) {
    return async (context) => {
        const i18nProps = await getI18nProps(context);

        if (getStaticPropsFunc) {
            const result = await getStaticPropsFunc(context);

            if (result.props) {
                return {
                    ...result,
                    props: {
                        ...result.props,
                        ...i18nProps,
                    },
                };
            }

            return result;
        }

        return {
            props: i18nProps,
        };
    };
};

// Wrapper for getServerSideProps
export function withI18nServerSideProps(getServerSidePropsFunc) {
    return async (context) => {
        const i18nProps = await getI18nProps(context);

        if (getServerSidePropsFunc) {
            const result = await getServerSidePropsFunc(context);

            if (result.props) {
                return {
                    ...result,
                    props: {
                        ...result.props,
                        ...i18nProps,
                    },
                };
            }

            return result;
        }

        return {
            props: i18nProps,
        };
    };
};