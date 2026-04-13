# WordPress Plugin: Simple SEO Optimizer
# Plugin Name: simple-seo-optimizer
# Version: 1.0.0
# Author:小七团队
# License: GPL v2

<?php
/**
 * Plugin Name: Simple SEO Optimizer
 * Description: 一键优化文章SEO (标题/描述/关键词)
 * Version: 1.0.0
 * Author:小七团队
 * License: GPL v2
 */

if (!defined('ABSPATH')) {
    exit;
}

// 定义插件常量
define('SSO_VERSION', '1.0.0');
define('SSO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SSO_PLUGIN_URL', plugin_dir_url(__FILE__));

// 激活插件
register_activation_hook(__FILE__, 'sso_activate');
function sso_activate() {
    // 创建默认设置
    $default_settings = array(
        'auto_generate' => true,
        'title_template' => '{title} | {site_name}',
        'description_length' => 160,
    );
    add_option('sso_settings', $default_settings);
}

// 停用插件
register_deactivation_hook(__FILE__, 'sso_deactivate');
function sso_deactivate() {
    // 清理工作
}

// 添加管理菜单
add_action('admin_menu', 'sso_add_admin_menu');
function sso_add_admin_menu() {
    add_menu_page(
        'Simple SEO',
        'Simple SEO',
        'manage_options',
        'simple-seo-optimizer',
        'sso_admin_page',
        'dashicons-search',
        99
    );
}

// 管理页面
function sso_admin_page() {
    ?>
    <div class="wrap">
        <h1>Simple SEO Optimizer</h1>
        <p>一键优化您的文章SEO设置</p>
        
        <?php
        $stats = sso_get_stats();
        ?>
        <div class="sso-stats">
            <div class="sso-stat-box">
                <h3>已优化文章</h3>
                <p class="sso-number"><?php echo $stats['optimized']; ?></p>
            </div>
            <div class="sso-stat-box">
                <h3>待优化</h3>
                <p class="sso-number"><?php echo $stats['pending']; ?></p>
            </div>
        </div>
        
        <h2>批量优化</h2>
        <form method="post">
            <?php wp_nonce_field('sso_bulk_optimize', 'sso_nonce'); ?>
            <p>
                <label>
                    <input type="checkbox" name="auto_generate" checked>
                    自动生成缺失的SEO信息
                </label>
            </p>
            <p>
                <input type="submit" name="sso_optimize" class="button button-primary" value="开始优化">
            </p>
        </form>
        
        <?php if (isset($_POST['sso_optimize'])): ?>
            <?php sso_process_bulk_optimize(); ?>
        <?php endif; ?>
    </div>
    <style>
        .sso-stats { display: flex; gap: 20px; margin: 20px 0; }
        .sso-stat-box { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); min-width: 150px; }
        .sso-stat-box h3 { margin-top: 0; color: #666; }
        .sso-number { font-size: 36px; font-weight: bold; color: #0073aa; margin: 10px 0; }
    </style>
    <?php
}

// 获取统计
function sso_get_stats() {
    $args = array(
        'post_type' => 'post',
        'posts_per_page' => -1,
        'post_status' => 'publish'
    );
    $posts = get_posts($args);
    
    $optimized = 0;
    $pending = 0;
    
    foreach ($posts as $post) {
        $seo_title = get_post_meta($post->ID, '_seo_title', true);
        $seo_desc = get_post_meta($post->ID, '_seo_description', true);
        
        if (!empty($seo_title) && !empty($seo_desc)) {
            $optimized++;
        } else {
            $pending++;
        }
    }
    
    return array('optimized' => $optimized, 'pending' => $pending);
}

// 批量优化
function sso_process_bulk_optimize() {
    if (!wp_verify_nonce($_POST['sso_nonce'], 'sso_bulk_optimize')) {
        return;
    }
    
    $args = array(
        'post_type' => 'post',
        'posts_per_page' => -1,
        'post_status' => 'publish'
    );
    $posts = get_posts($args);
    
    $optimized = 0;
    
    foreach ($posts as $post) {
        $result = sso_optimize_post($post->ID);
        if ($result) $optimized++;
    }
    
    echo '<div class="notice notice-success"><p>成功优化 ' . $optimized . ' 篇文章！</p></div>';
}

// 优化单篇文章
function sso_optimize_post($post_id) {
    $post = get_post($post_id);
    if (!$post) return false;
    
    $seo_title = get_post_meta($post_id, '_seo_title', true);
    $seo_desc = get_post_meta($post_id, '_seo_description', true);
    $seo_keywords = get_post_meta($post_id, '_seo_keywords', true);
    
    // 生成SEO标题
    if (empty($seo_title)) {
        $seo_title = sso_generate_seo_title($post);
        update_post_meta($post_id, '_seo_title', $seo_title);
    }
    
    // 生成SEO描述
    if (empty($seo_desc)) {
        $seo_desc = sso_generate_seo_description($post);
        update_post_meta($post_id, '_seo_description', $seo_desc);
    }
    
    // 生成关键词
    if (empty($seo_keywords)) {
        $seo_keywords = sso_generate_keywords($post);
        update_post_meta($post_id, '_seo_keywords', $seo_keywords);
    }
    
    return true;
}

// 生成SEO标题
function sso_generate_seo_title($post) {
    $title = $post->post_title;
    $site_name = get_bloginfo('name');
    
    $seo_title = $title . ' | ' . $site_name;
    
    // 限制60字符
    if (strlen($seo_title) > 60) {
        $seo_title = substr($seo_title, 0, 57) . '...';
    }
    
    return $seo_title;
}

// 生成SEO描述
function sso_generate_seo_description($post) {
    $content = strip_tags($post->post_content);
    $excerpt = wp_trim_words($content, 30, '');
    
    // 限制160字符
    if (strlen($excerpt) > 160) {
        $excerpt = substr($excerpt, 0, 157) . '...';
    }
    
    return $excerpt;
}

// 生成关键词
function sso_generate_keywords($post) {
    $title = strtolower($post->post_title);
    $content = strtolower(strip_tags($post->post_content));
    
    // 简单提取关键词 (实际应用中可以用更复杂的算法)
    $words = str_word_count($title . ' ' . $content, 1);
    $word_counts = array_count_values($words);
    arsort($word_counts);
    
    // 过滤常见词
    $stop_words = array('the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'her', 'way', 'many', 'oil', 'sit', 'set', 'run', 'eat', 'far', 'sea', 'eye', 'ago', 'off', 'too', 'any', 'say', 'man', 'try', 'ask', 'end', 'why', 'let', 'put', 'say', 'she', 'try', 'way', 'own', 'say', 'too', 'old', 'tell', 'very', 'when', 'much', 'would', 'there');
    
    $keywords = array();
    foreach ($word_counts as $word => $count) {
        if (strlen($word) > 3 && !in_array($word, $stop_words) && $count > 1) {
            $keywords[] = $word;
        }
        if (count($keywords) >= 5) break;
    }
    
    return implode(', ', $keywords);
}

// 在前端输出SEO标签
add_action('wp_head', 'sso_output_seo_tags');
function sso_output_seo_tags() {
    if (!is_single()) return;
    
    $post_id = get_the_ID();
    $seo_title = get_post_meta($post_id, '_seo_title', true);
    $seo_desc = get_post_meta($post_id, '_seo_description', true);
    $seo_keywords = get_post_meta($post_id, '_seo_keywords', true);
    
    if (!empty($seo_title)) {
        echo '<title>' . esc_html($seo_title) . '</title>' . "\n";
    }
    
    if (!empty($seo_desc)) {
        echo '<meta name="description" content="' . esc_attr($seo_desc) . '">' . "\n";
    }
    
    if (!empty($seo_keywords)) {
        echo '<meta name="keywords" content="' . esc_attr($seo_keywords) . '">' . "\n";
    }
}

// 在文章编辑页面添加SEO元框
add_action('add_meta_boxes', 'sso_add_meta_box');
function sso_add_meta_box() {
    add_meta_box(
        'sso_meta_box',
        'SEO优化设置',
        'sso_meta_box_callback',
        'post',
        'normal',
        'high'
    );
}

function sso_meta_box_callback($post) {
    wp_nonce_field('sso_save_meta', 'sso_meta_nonce');
    
    $seo_title = get_post_meta($post->ID, '_seo_title', true);
    $seo_desc = get_post_meta($post->ID, '_seo_description', true);
    $seo_keywords = get_post_meta($post->ID, '_seo_keywords', true);
    ?>
    <p>
        <label for="seo_title">SEO标题:</label>
        <input type="text" id="seo_title" name="seo_title" value="<?php echo esc_attr($seo_title); ?>" style="width:100%;">
    </p>
    <p>
        <label for="seo_description">SEO描述:</label>
        <textarea id="seo_description" name="seo_description" style="width:100%;" rows="3"><?php echo esc_textarea($seo_desc); ?></textarea>
    </p>
    <p>
        <label for="seo_keywords">关键词 (用逗号分隔):</label>
        <input type="text" id="seo_keywords" name="seo_keywords" value="<?php echo esc_attr($seo_keywords); ?>" style="width:100%;">
    </p>
    <p>
        <button type="button" class="button" onclick="sso_auto_generate()">一键自动生成</button>
    </p>
    <script>
    function sso_auto_generate() {
        // 简单的客户端生成 (实际应通过AJAX)
        var title = document.getElementById('title').value;
        var content = document.getElementById('content').value;
        
        document.getElementById('seo_title').value = title + ' | <?php echo get_bloginfo('name'); ?>';
        document.getElementById('seo_description').value = content.substring(0, 160).replace(/<[^>]*>/g, '');
    }
    </script>
    <?php
}

// 保存元数据
add_action('save_post', 'sso_save_meta');
function sso_save_meta($post_id) {
    if (!isset($_POST['sso_meta_nonce']) || !wp_verify_nonce($_POST['sso_meta_nonce'], 'sso_save_meta')) {
        return;
    }
    
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    if (isset($_POST['seo_title'])) {
        update_post_meta($post_id, '_seo_title', sanitize_text_field($_POST['seo_title']));
    }
    
    if (isset($_POST['seo_description'])) {
        update_post_meta($post_id, '_seo_description', sanitize_textarea_field($_POST['seo_description']));
    }
    
    if (isset($_POST['seo_keywords'])) {
        update_post_meta($post_id, '_seo_keywords', sanitize_text_field($_POST['seo_keywords']));
    }
}
