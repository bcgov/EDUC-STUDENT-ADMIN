<template>

                    <div
                            class="overlay"
                    >
                        <div class="modal">
                            <div class="modal__title">
                                <span>Session Expiring.</span>
                            </div>
                            <div class="p-3" style="margin: 2rem">
                                <p>You have left this browser idle for {{idleTime}} seconds.</p>
                                <p v-if="time === 1000">{{time/1000}} second left</p>
                                <p v-else>{{time/1000}} seconds left</p>
                                <a id="logout_href" :href='routes.LOGOUT'/>
                            </div>
                        </div>
                    </div>

</template>

<script>
    import {Routes} from "../utils/constants";
    export default {
        data() {
            return {
                time: 10000,
                routes: Routes,
                idleTime:process.env.VUE_APP_IDLE_TIMEOUT
            }
        },
        created() {
            let timerId = setInterval(() => {
                this.time -= 1000;
                // noinspection JSUnresolvedVariable
                if (!this.$store.state.idleVue.isIdle) clearInterval(timerId);

                if (this.time < 1) {
                    clearInterval(timerId);
                    this.logout();
                    // Your logout function should be over here
                    //alert('logout user....');
                    window.location = document.getElementById('logout_href').href;
                }
            }, 1000);
        },
        methods: {
            logout() {
                this.$store.commit('auth/setJwtToken');
                this.$store.commit('auth/setRefreshToken');
                this.$store.commit('auth/setAdminUser',false);
            }
        }

    };
</script>
<style scoped>
    .overlay {
        elevation: above;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.3);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal {
        elevation: higher;
        margin: 2rem;
        width: 30rem;
        box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 5px 8px 0 rgba(0, 0, 0, 0.14), 0 1px 14px 0 rgba(0, 0, 0, 0.12) !important;
        border-radius: 1rem;
        background-color: #FFFFFF;
        color: rgba(0, 0, 0, 0.87);
        @apply bg-white p-3;
    }

    .modal__title {
        margin: 2rem;
        color: #38404f;
        @apply flex items-center justify-between p-3 font-bold;
    }

</style>