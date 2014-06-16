<?php
/**
 * Plugin Name: jgit-wordpress
 * Plugin URI: https://github.com/bchartoff/jgit
 * Description: Wordpress CMS plugin for jgit cms -> github tool.
 * Version: 0.0.1
 * Author: Ben Chartoff
 * Author URI: http://benchartoff.com/
 * License: GPL2
 */

/*  Copyright 2014  Ben Chartoff  (email : bchartoff@gmail.com)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License, version 2, as 
    published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

    /**
 * Adds a box to the main column on the Post and Page edit screens.
 */





function add_commit_message_meta_box() {

	$screens = array( 'post', 'page' );

	foreach ( $screens as $screen ) {

		add_meta_box(
			'jgit_sectionid',
			__( 'Commit message', 'jgit_commit_message' ),
			'jgit_meta_box_callback',
			$screen
		);
	}
}
add_action( 'add_meta_boxes', 'add_commit_message_meta_box' );

/**
 * Prints the box content.
 * 
 * @param WP_Post $post The object for the current post/page.
 */
function jgit_meta_box_callback( $post ) {

	// Add an nonce field so we can check for it later.
	wp_nonce_field( 'jgit_meta_box', 'jgit_meta_box_nonce' );

	/*
	 * Use get_post_meta() to retrieve an existing value
	 * from the database and use the value for the form.
	 */
	//$value = get_post_meta( $post->ID, '_my_meta_value_key', true );

	echo '<label for="jgit_commit">';
	_e( 'Please enter a message describing any changes', 'jgit_commit_message' );
	echo '</label> ';
	echo '<input type="text" id="jgit_commit" name="jgit_commit" value="" size="25" />';
}

/**
 * When the post is saved, saves our custom data.
 *
 * @param int $post_id The ID of the post being saved.
 */
function jgit_save_meta_box_data( $post_id ) {

	/*
	 * We need to verify this came from our screen and with proper authorization,
	 * because the save_post action can be triggered at other times.
	 */

	// Check if our nonce is set.
	if ( ! isset( $_POST['jgit_meta_box_nonce'] ) ) {
		return;
	}

	// Verify that the nonce is valid.
	if ( ! wp_verify_nonce( $_POST['jgit_meta_box_nonce'], 'jgit_meta_box' ) ) {
		return;
	}

	// If this is an autosave, our form has not been submitted, so we don't want to do anything.
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	// Check the user's permissions.
	if ( isset( $_POST['post_type'] ) && 'page' == $_POST['post_type'] ) {

		if ( ! current_user_can( 'edit_page', $post_id ) ) {
			return;
		}

	} else {

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
	}

	/* OK, its safe for us to save the data now. */
	
	// Make sure that it is set.
	if ( ! isset( $_POST['jgit_commit'] ) ) {
		return;
	}

	// Sanitize user input.
	$my_data = sanitize_text_field( $_POST['jgit_commit'] );


	// $url = "http://7c967551.ngrok.com/contents/update" . get_path_by_post_id( $post_id ) . "index.html";
	// debug_to_console( get_path_by_post_id( $post_id ) );
	


	$response = wp_remote_request($url, array(
		'method' => 'POST',
		'blocking' => true,
		'body' => array( 		
				'cms' => 'wordpress',
				'published' => false,
				'message' => $my_data,
				'content' => get_content_by_post_id( $post_id ),
				'branch' => "bchartoff_dot_com_drafts"
				)
    	)
	);


	// $url = "https://api.github.com/orgs/octokit/repos";
	// wp_http_validate_url( $url )

	// $response = wp_remote_request($url,array(
	// 	'method' => 'GET'
	// 	)
	// );


	// if ( is_wp_error( $response ) ) {
	//    $error_message = $response->get_error_message();
	//    print_r( $path);
	//    echo $post_content;
	//    echo $post_path;
	//    echo  $post->post_content;
	//    echo "Something went wrong: $error_message";
	// } else {
	//    echo 'Response:<pre>';
	//    print_r( $response );
	//    echo '</pre>';
	// }

	// // Update the meta field in the database.
	update_post_meta( $post_id, '_my_meta_value_key', $my_data );



}
add_action( 'save_post', 'jgit_save_meta_box_data' );

/**
 * Posts to the jgit API middleware, which then posts to github
 * @param string $author the author's user name
 * @param string $commit_message the commit message
 * @param string $post_path the path to the post (in github repo full path will be content/wordpress/post_path)
 * @param string $post_content the post's contents
 */
// function post_to_jgit( $commit_message , $post_path , $post_content ){
// }


/**
 * Get post contents (as html) from a post_id
 * @param int $post_id The ID of the post being saved.
**/
function get_content_by_post_id( $post_id ){
	$content_post = get_post($my_postid);
	$content = $content_post->post_content;
	$content = apply_filters('the_content', $content);
	$content = str_replace(']]>', ']]&gt;', $content);

	return $content;

}


/**
 * For published posts, returns post path, for unpublished, returns `slug/ID/`
 * in middle ware, github path structure set to `cms/publication_status/path/
 * @param int $post_id The ID of the post being saved.
**/

function get_path_by_post_id ( $post_id ){
	$path_post = get_post( $post_id );
	if (in_array($path_post->post_status, array('draft', 'pending', 'auto-draft', 'pitch'))) {
	    // $cloned_post = clone $path_post;
	    // $cloned_post->post_status = 'publish';
	    //wp_update_post($cloned_post);
	    //$cloned_post->post_name = sanitize_title($cloned_post->post_name ? $cloned_post->post_name : $cloned_post->post_title, $cloned_post->ID);
	    return  '/' . $post_id . '/' .  $path_post->post_name;
	} else {
	    return str_replace(home_url(), '', get_permalink( $post_id ) );//get_permalink($cloned_post->ID);
	}
}


/**
 * Get relative path from a post_id
 * @param int $post_id The ID of the post being saved.
**/
// function get_path_by_post_id( $post_id ){
// 	$content_post = get_post($post_id);
// 	$url = $content_post->post_name;
// 	return $url;
// }



function debug_to_console( $data ) {

    if ( is_array( $data ) )
        $output = "<script>console.log( 'Debug Objects: " . implode( ',', $data) . "' );</script>";
    else
        $output = "<script>console.log( 'Debug Objects: " . $data . "' );</script>";

    echo $output;
}





function the_parent_slug() {
  global $post;
  if($post->post_parent == 0) return '';
  $post_data = get_post($post->post_parent);
  return $post_data->post_name;
}