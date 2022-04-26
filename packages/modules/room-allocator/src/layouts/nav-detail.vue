<template>
  <div class="nav-detail">
    <button class="toggle" :class="{ open: active }" @click="active = ! active">
      <div class="icon">
        <v-badge :dot="badge === true" bordered :value="badge" :disabled="!badge">
          <v-icon :name="icon" />
        </v-badge>
      </div>
      <div class="title">
        {{ title }}
      </div>
      <div class="icon">
        <v-icon class="expand-icon" :name="active ? 'expand_less' : 'expand_more'" />
      </div>
    </button>
    <transition-expand class="scroll-container">
      <div v-show="active">
        <div class="content">
          <slot />
        </div>
      </div>
    </transition-expand>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';

export default defineComponent({
  props: {
    icon: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    badge: {
      type: [Boolean, String, Number],
      default: null,
    },
  },
  setup(props) {
    const active = ref(false)
    return { active };
  },
});
</script>

<style>
body {
  --nav-detail-icon-color: var(--foreground-normal-alt);
  --nav-detail-color: var(--foreground-normal-alt);
  --nav-detail-color-active: var(--primary);
}
</style>

<style lang="scss" scoped>
.nav-detail {
  --v-badge-offset-x: 3px;
  --v-badge-offset-y: 4px;
  --v-badge-border-color: var(--background-normal-alt);
  --v-badge-background-color: var(--primary);
  --v-badge-color: var(--background-normal);

  display: contents;

  :deep(.type-label) {
    margin-bottom: 4px;
    font-size: 1rem;
  }

  .toggle {
    position: relative;
    display: flex;
    flex-shrink: 0;
    justify-content: space-between;
    width: 100%;
    height: 60px;
    color: var(--nav-detail-color);
    background-color: var(--background-normal-alt);

    .icon {
      --v-icon-color: var(--nav-detail-icon-color);

      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 100%;
    }

    &.open,
    &:hover {
      color: var(--nav-detail-color-active);

      .icon {
        --v-icon-color: var(--nav-detail-color-active);
      }
    }
  }

  .title {
    position: absolute;
    top: 50%;
    left: 52px;
    overflow: hidden;
    white-space: nowrap;
    transform: translateY(-50%);
  }

  .scroll-container {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .content {
    padding: 8px;

    :deep(.page-description) {
      margin-bottom: 8px;
      color: var(--foreground-subdued);
    }

    :deep(.page-description a) {
      color: var(--primary);
    }
  }

  .expand-icon {
    color: var(--foreground-subdued);
  }
}
</style>